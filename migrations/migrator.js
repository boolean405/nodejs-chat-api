const fs = require("fs");
const UserDB = require("../models/user-model");
const { Encoder } = require("../utils/core");

const Migrator = {
  migrate: async () => await migrate(),
  backup: async () => await backup(),
};

const migrate = async () => {
  let data = fs.readFileSync("./migrations/default_data.json");
  if (data) {
    let defaultData = JSON.parse(data);

    // User Migration
    if (defaultData.users) {
      defaultData.users.forEach(async (user) => {
        let existUser = await UserDB.findOne({ email: user.email });
        if (existUser) {
          console.log(
            `=> Skipped migration, ${user.name} user is already exist`
          );
          return;
        }
        user.password = Encoder.encode(user.password);
        await new UserDB(user).save();
        console.log(`=> Success, ${user.name} User migration`);
      });
    }
  }
};

const backup = async () => {
  let users = await UserDB.find();
  fs.writeFileSync("./migrations/backups/users.json", JSON.stringify(users));
  console.log("=> Success, Databases backup finished");
};

module.exports = {
  Migrator,
};
