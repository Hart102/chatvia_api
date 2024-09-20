const DbConnection = require("./Config/Db/index");
const { Chats, Users } = require("../../Config/Db/modal");
const { GetLastChatWithFriend } = require("../../Utils/index");

const fetchFriends = async (socket, data) => {
  try {
    const userId = data?.from_user;
    if (userId) {
      user = await Users.findOne({
        _id: new mongoos.Types.ObjectId(userId),
      }).select("_id photo_id username");

      const Friends = await GetLastChatWithFriend(userId);
      socket.emit("fetchFriends", { isError: false, payload: Friends });
    }
  } catch (error) {
    socket.emit({ isError: true, message: "Server error" });
  }
};

module.export = { fetchFriends };
