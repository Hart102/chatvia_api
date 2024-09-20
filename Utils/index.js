const mongoose = require("mongoose");
const { Users } = require("../Config/Db/modal");

const GetLastChatWithFriend = async (userId) => {
  try {
    const hostId = new mongoose.Types.ObjectId(userId);
    const user = await Users.findOne({
      _id: hostId,
    });

    if (user !== null) {
      const lastConversationWithFriends = await Users.aggregate([
        { $match: { "friends._id": userId } },

        {
          $lookup: {
            from: "chats",
            let: { friendId: "$_id" }, // Field from the Users collection
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      {
                        $and: [
                          { $eq: ["$from_user", hostId] },
                          { $eq: ["$to_user", "$$friendId"] },
                        ],
                      },
                      {
                        $and: [
                          { $eq: ["$from_user", "$$friendId"] },
                          { $eq: ["$to_user", hostId] },
                        ],
                      },
                    ],
                  },
                },
              },
              { $sort: { createdAt: -1 } }, // Selected on the Last message between two friends
              { $limit: 1 },
            ],
            as: "conversations",
          },
        },
        { $unwind: "$conversations" },
        {
          $project: {
            from_user: "$conversations.from_user",
            to_user: "$conversations.to_user",
            username: 1,
            photo_id: 1,
            message: "$conversations.message",
            createdAt: "$conversations.createdAt",
          },
        },
        { $sort: { createdAt: -1 } }, // Keep friend with the lastest message at the top
      ]);
      return lastConversationWithFriends;
    }
  } catch (error) {
    console.log({ isError: true, message: error.message });
  }
};

module.exports = { GetLastChatWithFriend };
