import { authenticateSessionToken } from "$lib/server/auth";
import prisma from "$lib/server/prisma";
import { error, fail, redirect } from "@sveltejs/kit";
import { DateTime } from "luxon";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, parent }) => {
  // get authentication
  const {
    auth: { error: authError, userID: currentUser },
  } = await parent();
  if (currentUser === params.userID.slice(1)) throw redirect(303, "/me");
  // get user
  // - prune tags for count
  const user = await prisma.user.findUnique({
    where: {
      id: params.userID.slice(1),
    },
    include: {
      inboundTags: true,
      outboundTags: true,
      games: {
        include: {
          game: true,
        },
      },
    },
  });
  if (!user) error(404);

  const {
    id: userID,
    nickname,
    profilePicture,
    bio,
    starredByIDs,
    starredIDs,
    inboundTags,
    outboundTags,
    games,
  } = user;

  // Filter user tags
  const tags = inboundTags.filter(
    ({ taggedAt }) =>
      DateTime.fromJSDate(taggedAt) > DateTime.now().minus({ month: 1 })
  ).length;
  const stars = starredByIDs.length;

  // tag/follow relationships
  const tagged = inboundTags.some(({ userID }) => userID === currentUser);
  const taggedMe = outboundTags.some(
    ({ targetID }) => targetID === currentUser
  );
  const starred =
    currentUser !== undefined && starredByIDs.includes(currentUser);
  const starredMe =
    currentUser !== undefined && starredIDs.includes(currentUser);

  return {
    loggedIn: authError === undefined,

    userID: userID,
    nickname,
    bio,
    profilePicture,

    tags,
    tagged,
    taggedMe,

    stars,
    starred,
    starredMe,

    games: games.map(({ game }) => game),
  };
};

export const actions: Actions = {
  tag: async ({ params, cookies }) => {
    const { error: authError, userID: currentUserID } =
      await authenticateSessionToken(cookies.get("session"));
    if (authError) return fail(401, { message: "You are not logged in!" });

    const targetUserID = params.userID.slice(1);
    if (currentUserID === targetUserID)
      return fail(400, { message: "You cannot tag yourself" });

    const currentUser = await prisma.user.findUniqueOrThrow({
      where: { id: currentUserID },
      include: { games: true },
    });
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserID },
      include: { games: true, inboundTags: true },
    });
    if (!targetUser) return fail(404, { message: "User not found" });

    const tagged = targetUser.inboundTags.some(
      ({ userID }) => userID === currentUserID
    );
    if (tagged)
      return fail(401, {
        message: `You have already tagged ${
          targetUser.nickname ?? "@" + targetUser.id
        }!`,
      });

    const currentUserGames = currentUser.games.map(({ gameID }) => gameID);
    const targetGames = targetUser.games
      .filter(({ gameID }) => currentUserGames.includes(gameID))
      .map(({ id }) => id);
    if (targetGames.length === 0)
      return fail(400, {
        message: `You and ${
          targetUser.nickname ?? "@" + targetUser.id
        } don't share any games...`,
      });

    await prisma.tag.create({
      data: {
        userID: currentUserID,
        targetID: targetUserID,
        remainingGameDataIDs: targetGames,
        gameDataIDs: targetGames,
      },
    });

    return { message: `Tagged ${targetUser.nickname ?? "@" + targetUser.id}!` };
  },
  star: async ({ params, cookies }) => {
    const { error: authError, userID: currentUserID } =
      await authenticateSessionToken(cookies.get("session"));
    if (authError) return fail(401, { message: "You are not logged in!" });

    const targetUserID = params.userID.slice(1);
    if (currentUserID === targetUserID)
      return fail(400, { message: "You cannot tag yourself" });

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserID },
    });
    if (!targetUser) return fail(404, { message: "User not found" });

    if (targetUser.starredByIDs.includes(currentUserID)) {
      await prisma.user.update({
        where: { id: targetUserID },
        data: {
          starredBy: {
            disconnect: {
              id: currentUserID,
            },
          },
        },
      });
      return {
        message: `Unstarred ${targetUser.nickname ?? "@" + targetUser.id}`,
      };
    } else {
      await prisma.user.update({
        where: { id: targetUserID },
        data: {
          starredBy: {
            connect: {
              id: currentUserID,
            },
          },
        },
      });
      return {
        message: `Starred ${targetUser.nickname ?? "@" + targetUser.id}!`,
      };
    }
  },
};
