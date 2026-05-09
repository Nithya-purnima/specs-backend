const bcrypt = require("bcrypt");

bcrypt.hash("admin@123", 10).then(hash => {
    console.log("Generated Hash:");
    console.log(hash);
});