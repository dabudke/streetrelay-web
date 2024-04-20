import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";
import { DateTime } from "luxon";

export const load: PageServerLoad = async ({ parent }) => {
  const {
    auth: { error, userID },
  } = await parent();
  if (error) redirect(303, `/login?r=${encodeURIComponent("/me")}`);

  const { nickname, profilePicture, bio, starredByIDs, inboundTags, games } =
    await prisma.user.findUniqueOrThrow({
      where: {
        id: userID,
      },
      include: {
        inboundTags: true,
        games: {
          include: {
            game: true,
          },
        },
      },
    });

  const stars = starredByIDs.length;
  const tags = inboundTags.filter(
    ({ taggedAt }) =>
      DateTime.fromJSDate(taggedAt) > DateTime.now().minus({ month: 1 })
  ).length;

  return {
    userID: userID as string,
    nickname,
    bio,
    profilePicture,

    stars,
    tags,

    games: games.map(({ game }) => game),
  };
};
