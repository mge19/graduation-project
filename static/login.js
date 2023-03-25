$(document).ready(function () {
    $("#submitButton").click(function () {
        console.log("clicked");
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:2020/login",
            data:{username:$('#username'),password:$('#password')},
	    success: function(data){}
        });
    });

});