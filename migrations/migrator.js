const fs = require("fs");
const Helper = require("../utils/helper");
const UserDB = require("../models/user");
const RoleDB = require("../models/role");
const PermitDB = require("../models/permit");
const CategoryDB = require("../models/category");
const SubCategoryDB = require("../models/sub_category");
const ChildCategoryDB = require("../models/child_category");
const TagDB = require("../models/tag");
const ProductDB = require("../models/product");

const defaultDataMigrate = async () => {
  let data = fs.readFileSync("./migrations/default_data.json");
  if (data) {
    let default_data = JSON.parse(data);

    // User Migration
    if (default_data.users) {
      default_data.users.forEach(async (user) => {
        user.password = Helper.encode(user.password);
        let db_user = await UserDB.findOne({ name: user.name });
        if (db_user) {
          console.log(`Skipped, ${user.name} User is already exist`);
        } else {
          await new UserDB(user).save();
          console.log(`Success, ${user.name} User migration`);
        }
      });
      await Helper.timer(1);
    }

    // Roles Migration
    if (default_data.roles) {
      default_data.roles.forEach(async (role) => {
        let db_role = await RoleDB.findOne({ name: role.name });
        if (db_role) {
          console.log(`Skipped, ${role.name} Role is already exist`);
        } else {
          await new RoleDB(role).save();
          console.log(`Success, ${role.name} Role migration`);
        }
      });
      await Helper.timer(1);
    }

    // Permits Migration
    if (default_data.permits) {
      default_data.permits.forEach(async (permit) => {
        let db_permit = await PermitDB.findOne({ name: permit.name });
        if (db_permit) {
          console.log(`Skipped, ${permit.name} Permit is already exist`);
        } else {
          await new PermitDB(permit).save();
          console.log(`Success, ${permit.name} Permit migration`);
        }
      });
      await Helper.timer(1);
    }

    // Categories Migrations
    if (default_data.categories) {
      default_data.categories.forEach(async (category) => {
        let db_cat = await CategoryDB.findOne({ name: category.name });
        if (db_cat) {
          console.log(`Skipped, ${category.name} Category is already exist`);
        } else {
          await new CategoryDB(category).save();
          console.log(`Success, ${category.name} Category migration`);
        }
      });
      await Helper.timer(1);
    }

    // Sub Categories Migration
    if (default_data.sub_categories) {
      default_data.sub_categories.forEach(async (sub_category) => {
        let db_sub_cat = await SubCategoryDB.findOne({
          name: sub_category.name,
        });
        if (db_sub_cat) {
          console.log(
            `Skipped, ${sub_category.name} Sub Category is already exist`
          );
        } else {
          await new SubCategoryDB(sub_category).save();
          console.log(`Success, ${sub_category.name} Sub Category migration`);
        }
      });
      await Helper.timer(1);
    }

    // Child Categories Migration
    if (default_data.child_categories) {
      default_data.child_categories.forEach(async (child_category) => {
        let db_child_cat = await ChildCategoryDB.findOne({
          name: child_category.name,
        });
        if (db_child_cat) {
          console.log(
            `Skipped, ${child_category.name} Child Category is already exist`
          );
        } else {
          await new ChildCategoryDB(child_category).save();
          console.log(
            `Success, ${child_category.name} Child Category migration`
          );
        }
      });
      await Helper.timer(1);
    }

    // Tags Migrations
    if (default_data.tags) {
      default_data.tags.forEach(async (tag) => {
        let db_tag = await TagDB.findOne({ name: tag.name });
        if (db_tag) {
          console.log(`Skipped, ${tag.name} Tag is already exist`);
        } else {
          await new TagDB(tag).save();
          console.log(`Success, ${tag.name} Tag migration`);
        }
      });
      await Helper.timer(1);
    }

    // Products Migrations
    if (default_data.products) {
      default_data.products.forEach(async (product) => {
        let db_product = await ProductDB.findOne({ name: product.name });
        if (db_product) {
          console.log(`Skipped, ${product.name} Product is already exist`);
        } else {
          await new ProductDB(product).save();
          console.log(`Success, ${product.name} Product migration`);
        }
      });
      await Helper.timer(1);
    }
  }

  await addRoleToUser("Owner", "Owner");
  await addRoleToUser("Admin", "Admin");
  await addCategoryToProduct("Phuket", "Phi Phi Island");
  await addSubCatToProduct("Island", "Phi Phi Island");
  await addTagsToProduct(["Popular", "New Arrival"], "Phi Phi Island");
  await addPermitsToRole(["Can View", "Can Edit", "Can Delete"], "Owner");
  // await addSubCatToChildCat('Island', 'Phi Phi Island');
  // await addChildCatToSubCat('Phi Phi Island', 'Island');
};

const addRoleToUser = async (role_name, user_name) => {
  let db_user = await UserDB.findOne({ name: user_name }).populate("roles");
  let db_role = await RoleDB.findOne({ name: role_name });
  if (db_user && db_role) {
    if (db_user.roles.length > 0) {
      let db_exist_role = db_user.roles.find((role) => role.name == role_name);
      if (db_exist_role) {
        console.log(
          `Skipped, ${db_role.name} Role is already exist in ${db_user.name} User`
        );
      } else {
        await UserDB.findByIdAndUpdate(db_user._id, {
          $push: { roles: db_role._id },
        });
        console.log(
          `Success, ${db_role.name} Role is added to ${db_user.name} User`
        );
      }
    } else {
      await UserDB.findByIdAndUpdate(db_user._id, {
        $push: { roles: db_role._id },
      });
      console.log(
        `Success, ${db_role.name} Role is added to ${db_user.name} User`
      );
    }
  }
  await Helper.timer(1);
};

const addCategoryToProduct = async (cat, product) => {
  let db_cat = await CategoryDB.findOne({ name: cat });
  let db_product = await ProductDB.findOne({ name: product });
  if (db_cat && db_product) {
    if (db_cat._id.equals(db_product.category)) {
      console.log(
        `Skipped, ${db_cat.name} Category is already exist in ${db_product.name} Product Category`
      );
    } else {
      await ProductDB.findByIdAndUpdate(db_product._id, {
        $push: { category: db_cat._id },
      });
      console.log(
        `Success, ${db_cat.name} Category is added to ${db_product.name} Product Category`
      );
    }
  }
  await Helper.timer(1);
};

const addSubCatToProduct = async (sub_cat, product) => {
  let db_sub_cat = await SubCategoryDB.findOne({ name: sub_cat });
  let db_product = await ProductDB.findOne({ name: product });
  if (db_sub_cat && db_product) {
    if (db_sub_cat._id.equals(db_product.sub_category)) {
      console.log(
        `Skipped, ${db_sub_cat.name} Sub Category is already exist in ${db_product.name} Product Sub Category`
      );
    } else {
      await ProductDB.findByIdAndUpdate(db_product._id, {
        $push: { sub_category: db_sub_cat._id },
      });
      console.log(
        `Success, ${db_sub_cat.name} Sub Category is added to ${db_product.name} Product Sub Category`
      );
    }
  }
  await Helper.timer(1);
};

const addTagsToProduct = async (tags, product) => {
  tags.forEach(async (tag) => {
    let db_tag = await TagDB.findOne({ name: tag });
    let db_product = await ProductDB.findOne({ name: product }).populate(
      "tags"
    );
    if (db_tag && db_product) {
      if (db_product.tags.length > 0) {
        let exist_tag = db_product.tags.find((tag) => tag.name == db_tag.name);
        if (exist_tag) {
          console.log(
            `Skipped, ${db_tag.name} Tag is already exist in ${db_product.name} Product`
          );
        } else {
          await ProductDB.findByIdAndUpdate(db_product._id, {
            $push: { tags: db_tag._id },
          });
          console.log(
            `Success, ${db_tag.name} Tag is added to ${db_product.name} Product`
          );
        }
      } else {
        await ProductDB.findByIdAndUpdate(db_product._id, {
          $push: { tags: db_tag._id },
        });
        console.log(
          `Success, ${db_tag.name} Tag is added to ${db_product.name} Product`
        );
      }
    }
  });
  await Helper.timer(1);
};

const addPermitsToRole = async (permits, role) => {
  permits.forEach(async (permit) => {
    let db_permit = await PermitDB.findOne({ name: permit });
    let db_role = await RoleDB.findOne({ name: role }).populate("permits");
    if (db_permit && db_role) {
      if (db_role.permits.length > 0) {
        let exist_permit = db_role.permits.find(
          (permit) => permit.name == db_permit.name
        );
        if (exist_permit) {
          console.log(
            `Skipped, ${db_permit.name} Permit is already exist in ${db_role.name} Role`
          );
        } else {
          await RoleDB.findByIdAndUpdate(db_role._id, {
            $push: { permits: db_permit._id },
          });
          console.log(
            `Success, ${db_permit.name} Permit is added to ${db_role.name} Role`
          );
        }
      } else {
        await RoleDB.findByIdAndUpdate(db_role._id, {
          $push: { permits: db_permit._id },
        });
        console.log(
          `Success, ${db_permit.name} Permit is added to ${db_role.name} Role`
        );
      }
    }
  });
  await Helper.timer(1);
};

const addSubCatToChildCat = async (sub_cat, child_cat) => {
  let db_sub_cat = await SubCategoryDB.findOne({ name: sub_cat });
  let db_child_cat = await ChildCategoryDB.findOne({ name: child_cat });
  if (db_sub_cat && db_child_cat) {
    if (db_sub_cat._id.equals(db_child_cat.sub_category)) {
      console.log(
        `Skipped, ${db_sub_cat.name} Sub Category is already exist in ${db_child_cat.name} Child Category`
      );
    } else {
      await ChildCategoryDB.findByIdAndUpdate(db_child_cat._id, {
        $push: { sub_category: db_sub_cat._id },
      });
      console.log(
        `Success, ${db_sub_cat.name} Sub Category is added to ${db_child_cat.name} Child Category`
      );
    }
  }
  await Helper.timer(1);
};

const addChildCatToSubCat = async (child_cat, sub_cat) => {
  let db_sub_cat = await SubCategoryDB.findOne({ name: sub_cat });
  let db_child_cat = await ChildCategoryDB.findOne({ name: child_cat });
  if (db_sub_cat && db_child_cat) {
    if (db_sub_cat.child_categories.length > 0) {
      db_sub_cat.child_categories.forEach(async (child_category) => {
        if (child_category.equals(db_child_cat._id)) {
          console.log(
            `Skipped, ${db_child_cat.name} Child Category is already exist in ${db_sub_cat.name} Sub Category`
          );
        } else {
          await SubCategoryDB.findByIdAndUpdate(db_sub_cat._id, {
            $push: { child_categories: db_child_cat._id },
          });
          console.log(
            `Success, ${db_child_cat.name} Child Category is added to ${db_sub_cat.name} Sub Category`
          );
        }
      });
    } else {
      await SubCategoryDB.findByIdAndUpdate(db_sub_cat._id, {
        $push: { child_categories: db_child_cat._id },
      });
      console.log(
        `Success, ${db_child_cat.name} Child Category is added to ${db_sub_cat.name} Sub Category`
      );
    }
  }
  await Helper.timer(1);
};

const backup = async () => {
  let users = await UserDB.find();
  let roles = await RoleDB.find();
  let permits = await PermitDB.find();
  let categories = await CategoryDB.find();
  let sub_categories = await SubCategoryDB.find();
  let child_categories = await ChildCategoryDB.find();
  let tags = await TagDB.find();
  let products = await ProductDB.find();

  fs.writeFileSync("./migrations/backups/users.json", JSON.stringify(users));
  fs.writeFileSync("./migrations/backups/roles.json", JSON.stringify(roles));
  fs.writeFileSync(
    "./migrations/backups/permits.json",
    JSON.stringify(permits)
  );
  fs.writeFileSync(
    "./migrations/backups/category.json",
    JSON.stringify(categories)
  );
  fs.writeFileSync(
    "./migrations/backups/sub_categories.json",
    JSON.stringify(sub_categories)
  );
  fs.writeFileSync(
    "./migrations/backups/child_categories.json",
    JSON.stringify(child_categories)
  );
  fs.writeFileSync("./migrations/backups/tags.json", JSON.stringify(tags));
  fs.writeFileSync(
    "./migrations/backups/product.json",
    JSON.stringify(products)
  );
  console.log("Success, All Databases Backup Finished");
};

module.exports = {
  defaultDataMigrate,
  backup,
};
