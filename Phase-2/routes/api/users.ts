import { Handlers } from "$fresh/server.ts";
import { get_all_user_info } from "~/utils/usermanagement.ts";

export const handler: Handlers = {
  async GET(_, ctx) {
    try {
      // Use 'await' to resolve the Promise
      const users = await get_all_user_info();
      const userList = [];
      for (const user of users) {
        userList.push({
          username: user[7],
          isAdmin: user[6],
          canSearch: user[0],
          canDownload: user[1],
          canUpload: user[2],
          userGroup: user[5],
          tokenStartTime: user[3],
          tokenApiInteractions: user[4],
        });
      }
      return new Response(JSON.stringify(userList), { status: 200 });
    } catch (error) {
      console.error("Error fetching user info:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
