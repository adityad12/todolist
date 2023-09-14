//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb+srv://adityadandwate2003learn:Aditya%409422@cluster0.8jjpxcc.mongodb.net/todolistDB");
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList!!"
});

const item2 = new Item({
  name: "Hit the + button to add new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", async(req, res) =>{

  Item.find().then((foundItems)=>{
    if(foundItems.length=== 0){
      Item.insertMany(defaultItems).then(()=>{
        console.log("Data added successfully.");
       
      }).catch((err)=>{
        console.log(err)
      });
      res.redirect("/");
    }else{
      res.render("list", {listName:null, listTitle: "Today", newListItems: foundItems});
    }  
   
  }).catch((err)=>{
    console.log(err);
  });

  
  

});

app.get("/:customListName", (req,res)=>{

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then((foundList)=>{
    
    if(!foundList){
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
      
      list.save();
      res.redirect("/"+ customListName)
    }else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      
    }
  }).catch((err)=>{
    console.log(err)
  })

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    }).catch((err)=>{
      console.log(err);
    });
  }

 
});

app.post("/delete", (req,res)=>{
  
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkItemId).then(()=>{
      console.log("Item deleted successfully")
      res.redirect("/");
    }).catch((err)=>{
      console.log(err);
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: { items: {_id: checkItemId} }}).then(()=>{
      res.redirect("/"+listName)
    }).catch((err)=>{
      console.log(err);
    });
  }

  
  
});

app.get("/about", function(req, res){
  res.render("about");
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
