//npm install the dependencies
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { functions } = require("lodash");
const mongoose=require("mongoose");
const getDate= require(__dirname+"/myDateModule");

let currentDate= getDate();
let postArr=[];

let Post;
async function dbConnectAndInitialise(){
    await mongoose.connect('mongodb://127.0.0.1:27017/blogSiteDB');
    console.log("connected to db");
    const postSchema =new mongoose.Schema({
        title:String,
        content:String
    })

    Post=mongoose.model("Post",postSchema)

    let dbPosts=await Post.find({});
    let arr=[]
    dbPosts.forEach(ele => {
        arr.push(ele);
    });
    postArr= arr;
    console.log("content from db loaded into postArr");
}
dbConnectAndInitialise().catch(function(err){
    console.log(err);
});

async function insertData(data){
    const post= new Post({
        title:data.title,
        content:data.content
    })
    await post.save();
    console.log("inserted this in db => "+JSON.stringify(data));
}

async function deleteData(data){
    await Post.deleteOne({title:data})
    console.log("deleted post with title "+data+" from db");
}

async function clearPostsInDB(){
    try {
        // Delete all documents in the collection
        const result = await Post.deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents from the collection.`);
      } catch (err) {
        console.error('Error clearing collection:', err);
      }
}









const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque.Mauris ultrices eros in cursus turpis massa tincidunt dui. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/",function (req,res){
  // console.log(postArr);
  res.render("home",{ startingContent:homeStartingContent,posts:postArr,todaysDate:currentDate})
});


app.get("/about",function(req,res){
  res.render("about",{aboutContent:aboutContent})
});

app.get("/contact",function(req,res){
  res.render("Contact",{contactContent:contactContent})
});

app.get("/compose",function(req,res){
  res.render("compose");
});

app.post("/compose",async function(req,res){
  let post={
    title:req.body.postTitle,
    content:req.body.postBody
  }
  postArr.push(post);
  console.log("added this post to postArr => "+JSON.stringify(post));
  await insertData(post);
  res.redirect("/");
}) 

app.get("/posts/:post",function(req,res){
  console.log("post view request, post index => "+req.params.post);
  if (req.params.post>=0 && req.params.post<postArr.length) {
    res.render("post",{postObj:postArr[req.params.post],postNumber:req.params.post})  
  }
  else{
    res.send("Not Available")
  }
  
})

app.get("/delete/:post",async function(req,res){
  console.log("post delete request, post index => "+req.params.post);
  let indexToRemove=req.params.post;
  let titleOfPostToDelete=postArr[req.params.post].title;
  await deleteData(titleOfPostToDelete);
  postArr.splice(indexToRemove,1);
  res.redirect("/");
})

app.get("/deleteAll",async function(req,res){
  console.log("request to delete all posts made");
  await clearPostsInDB();
  postArr=[];
  res.redirect("/");

})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});

//when running with nodmon database connection closed message is inconsistent, works perfectly when ruinning with "node app.js"
process.on('SIGINT', async () => {
  console.log('SIGINT event triggered.');
  try {
      await mongoose.connection.close();
      console.log('Database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database connection:', err);
      process.exit(1);
    }
});

process.on('exit', (code) => {
  console.log(`Exiting with code ${code}`);
});
