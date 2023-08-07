function todaysDate(){
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today  = new Date();
    var currentDate=today.toLocaleDateString("en-US", options);
    return currentDate;
}

module.exports=todaysDate;