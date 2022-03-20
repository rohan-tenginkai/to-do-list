const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rohan:Test123@cluster0.wf1ws.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Buy Food"
});
const item2 = new Item ({
    name: "Cook Food"
});
const item3 = new Item ({
    name: "Eat Food"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = new mongoose.model("List", listSchema);

app.get("/", function(req, res){
    
    Item.find({}, function(err, results){
        if(results.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully saved default items to DB");
                }
            });
            res.redirect("/");
        }else{
            res.render("list", {
                listTitle: "Today",
                newListItems: results
            });
        }
    });
});

app.post("/", function(req, res){
    let itemName = req.body.newItem;
    let listName = req.body.list;

    const newItem = new Item({
        name: itemName
    });

    if(listName === "Today"){
        newItem.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, results){
            if(!err){
                results.items.push(newItem);
                results.save();
                res.redirect("/" + listName);
            }
        });
    }
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err){
                console.log(err);
            }else{
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, results){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
});

app.get("/:list", function(req, res){
    const newList = _.capitalize(req.params.list);

    List.findOne({name: newList}, function(err, results){
        if(err){
            console.log(err);
        }else{
            if(!results){
                const list = new List({
                    name: newList,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + newList);
            }else{
                res.render("list", {
                    listTitle: results.name,
                    newListItems: results.items
                });
            }
        }
    });

    

});

app.get("/about", function(req, res){
    res.render("about");
});

app.listen(process.env.PORT, function(){
    console.log("Server is running on 3000");
});