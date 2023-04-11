import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const uJohnDoe = await prisma.user.upsert({
    where: { id: "johndoe" },
    update: {},
    create: {
      id: "johndoe",
      nickname: "John Doe",
      games: {
        create: [{
          gameID: "common",
          data: Buffer.from("100010111010010111010", "binary")
        }, {
          gameID: "john",
          data: Buffer.from("100101110001011","binary")
        }]
      }
    }
  });

  const uJaneDoe = await prisma.user.upsert({
    where: { id: "janedoe" },
    update: {},
    create: {
      id: "janedoe",
      nickname: "Jane Doe",
      games: {
        create: [{
          gameID: "common",
          data: Buffer.from("10010111001101","binary")
        }, {
          gameID: "jane",
          data: Buffer.from("1010101110","binary"),
        }]
      }
    }
  });

  const gCommon = await prisma.game.upsert({
    where: { id: "common" },
    update: {},
    create: {
      id: "common",
      title: "Common Game",
      icon: "https://via.placeholder.com/48.png/FF0/000"
    }
  });

  const gJohn = await prisma.game.upsert({
    where: { id: "john" },
    update: {},
    create: {
      id: "john",
      title: "John-Specific Game",
      icon: "https://via.placeholder.com/48.png/F00/000"
    }
  });

  const gJane = await prisma.game.upsert({
    where: { id: "jane" },
    update: {},
    create: {
      id: "jane",
      title: "Jane-Specific Game",
      icon: "https://via.placeholder.com/48.png/0F0/000"
    }
  });

  console.log({ uJohnDoe, uJaneDoe }, { gCommon, gJohn, gJane });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
