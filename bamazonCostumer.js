var mysql = require("mysql");
var inquirer = require("inquirer");


var connection = mysql.createConnection({

    port: 3306,
    user: "root",
    password: "Luis7894560",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    // afterConnection();
    start();
});

function start() {
    inquirer.prompt(
        {
            name: "whatareyou",
            message: "ARE YOU A [COSTUMER], [MANAGER], OR [SUPERVISOR]",
            type: "list",
            choices: ["COSTUMER", "MANAGER", "SUPERVISOR", "EXIT"]
        }).then(function (answer) {
            if (answer.whatareyou === "COSTUMER") {
                costumer();
            }
            else if (answer.whatareyou === "MANAGER") {
                console.log("im a manager");
            }
            else if (answer.whatareyou === "SUPERVISOR") {
                console.log("im a supervisor");
            }
            else {
                connection.end();
            }

        })

}


function costumer() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) {
            throw err;
        };
        for (var i = 0; i < res.length; i++) {
            console.log("id: " + res[i].item_id + " name: " + res[i].product_name + " price: " + res[i].price  + " In-stock: " + res[i].stock_quantity)
        }


        inquirer.prompt([
            //  The first should ask them the ID of the product they would like to buy.
            {
                name: "BUY",
                type: "rawlist",
                choices: function () {
                    var array = [];
                    for (var i = 0; i < res.length; i++) {
                        array.push(res[i].product_name);
                    }
                    return array;
                },
                message: "WHAT PRODUCT WOULD YOU LIKE TO BUY?"
            },
            {
                // The second message should ask how many units of the product they would like to buy.
                name: "AMOUNT",
                message: "HOW MANY WOULD YOU LIKE?",
                type: "input"
            }
        ]).then(function (answer) {
            var result
            var item;
            var name;
            var total;
            function total() {
                var amount = parseInt(answer.AMOUNT);
                var stock = item.stock_quantity;
                var price = item.price;
                result = stock - amount;

                total = amount * price;
            }
            for (var i = 0; i < res.length; i++) {
                if (res[i].product_name === answer.BUY) {
                    item = res[i];
                    name = res[i].product_name;
                }
            }
            total();
            inquirer.prompt([
                {
                    name: "price",
                    message: "you total would be " + total + " do you still want to make this purchase?",
                    type: "confirm"
                }
            ]).then(function (answers) {
                if (answers.price === true) {
                    if (item.stock_quantity >= parseInt(answer.AMOUNT)) {
                        connection.query("UPDATE products SET ? WHERE ?", [
                            {
                                stock_quantity: result
                            },
                            {
                                item_id: item.item_id
                            }
                        ])
                        console.log("purchase succesful!")
                    }
                    else if(item.stock_quantity < parseInt(answer.AMOUNT)) {
                        console.log("We don't have the amount of " + name + " you're looking for")
                    }
                    start();
                }
                else{
                    start();
                }

            })
        })
    });
}