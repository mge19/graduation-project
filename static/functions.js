var project_data=[];
var text=[
{"english":"Edit a Project","turkish":"Bir Projeyi Düzenle"}, //0
{"english":"Project Title","turkish":"Proje Konusu"}, //1
{"english":"Project Advisor","turkish":"Proje Danışmanı"}, //2
{"english":"Student Number","turkish":"Öğrenci Numarası"}, //3
{"english":"Update","turkish":"Güncelle"}, //4
{"english":"Delete All","turkish":"Tümünü Sil"}, //5
{"english":"New Project Title","turkish":"Yeni Proje Konusu"}, //6
{"english":"New Project Advisor","turkish":"Yeni Proje Danışmanı"}, //7
];
$(document).ready(function () {
    $(".deleteAnnouncement").click(function (e) {
        e.preventDefault();
        let pos = $(".deleteAnnouncement").index($(this));
		$.ajax({
			type: "POST",
			url: "/delete/announcements",
			data: {
				value: pos,
			},
			success: function (data) {
				window.location.reload();
			},
		});				
    });
    $(".deleteHomework").click(function (e) {
        e.preventDefault();
        let pos = $(".deleteHomework").index($(this));
		$.ajax({
			type: "POST",
			url: "/delete/homeworks",
			data: {
				value: pos,
			},
			success: function (data) {
				window.location.reload();
			},
		});				
    });
    $(".updateAnnouncement").submit(function (e) {
        e.preventDefault();
		let pos = $(".updateAnnouncement").index($(this));
		var new_header=$('.new_header')[pos].value;
		var new_details=$('.new_details')[pos].value;
		var files=$('.updatefiles')[pos].files;
		var formData=new FormData();
		formData.append('new_header',new_header);
		formData.append('new_details',new_details);
		$.each(files,function(i,file){
			formData.append('updatefiles',file);
		});
		$.ajax({
            type: "POST",
            url: "/getIDOfIndex/announcements",
            data: {
                value: pos,
            },
            success: function (data) {
				formData.append('id',data);
                console.log("AJAX RETURN: ", data);
				$.ajax({
					type: "POST",
					url: "/update/announcements",
					data:formData,
					processData:false,
					contentType:false,
					success: function (data) {
						window.location.reload();
					},
				}); 
            },
        });     
    });
    $(".updateHomework").submit(function (e) {
        e.preventDefault();
		let pos = $(".updateHomework").index($(this));
		var new_header=$('#new_header')[pos].value;
		var new_details=$('#new_details')[pos].value;
		var new_date=$('#new_date')[pos].value;
		var new_time=$('#new_time')[pos].value;
		var files=$('#updatefiles')[pos].files;
		var formData=new FormData();
		formData.append('new_header',new_header);
		formData.append('new_details',new_details);
		formData.append('new_date',new_date);
		formData.append('new_time',new_time);
		$.each(files,function(i,file){
			formData.append('updatefiles',file);
		});
		$.ajax({
            type: "POST",
            url: "/getIDOfIndex/homeworks",
            data: {
                value: pos,
            },
            success: function (data) {
				formData.append('id',data);
                console.log("AJAX RETURN: ", data);
				$.ajax({
					type: "POST",
					url: "/update/homeworks",
					data:formData,
					processData:false,
					contentType:false,
					success: function (data) {
						window.location.reload();
					},
				}); 
            },
        });     
    });
	$('.query').on('click', function (e) {
		var search={};
		search[$('#searchType').val()]={$regex:'.*'+$('#searchQuery').val()+'.*'};
		console.log(search);
		$.ajax({
            type: "POST",
            url: "/searchProjects",
            data: {
				query:JSON.stringify(search),
			},
            success: function (data) {
				let table=$('.results');
				table.empty();
				if(data.length!=0){
					var s=$('.text').html();
					console.log(s);
					var language="english";
					if(s=="Duyurular"){
					language="turkish";}
					var inhtml = '<table><tr><th>'+text[3][language]+'</th><th>'+text[1][language]+'</th><th>'+text[2][language]+'</th><th></th></tr>';
					for (var i = 0; i < data.length; i++) {
						var project=data[i];
						project_data.push(project);
						inhtml+='<tr><td>'+project.student+'</td>';
						inhtml+='<td>'+project.title+'</td>';
						inhtml+='<td>'+project.advisor+'</td>';
						inhtml+='<td><i class="fa fa-edit col-6" id="update_project" onclick=show_hide("update_form_project",this)></i>';
						inhtml+='<i class="fa fa-trash col-6 deleteProject"></i>';
						inhtml+='<div class="update_form_project" style="display:none">';
						inhtml+='<form class="updateProject" method="post"><h3>'+text[0][language]+'</h3>';
						inhtml+='<input type="text" value='+project.title+' class="col-xl-6 col-md-12 new_title" name="new_title" placeholder="'+text[6][language]+'" required><br><br>';
						inhtml+='<input type="text" value='+project.advisor+' class="col-xl-6 col-md-12 new_advisor" name="new_advisor" placeholder="'+text[7][language]+'" required><br><br>';
						inhtml+='<button type="submit" class="btn btn-success">'+text[4][language]+'</button></form></td></tr>';
					}
					inhtml+='</table><button type="submit" class="btn btn-danger deleteAllProjects">'+text[5][language]+'</button>';
					table.append(inhtml);
				}
			},
		});
		console.log(project_data); 
	});
	$('.deleteAllAnnouncements').on('click', function (e) {
		$.ajax({
            type: "POST",
            url: "/deleteall/announcements",
			success:function(){
				window.location.reload();
			},
		});
	});
	$('.deleteAllHomeworks').on('click', function (e) {
		$.ajax({
            type: "POST",
            url: "/deleteall/homeworks",
			success:function(){
				window.location.reload();
			},
		});
	});
	$('.deleteFileAnnouncements').on('click', function (e) {
		let pos=$('.show_hide_announcement').index($(this).closest('li'));
		let fileid=$('.file_announcements').index($(this).closest('tr'));
		console.log(pos);
		$.ajax({
			type: "POST",
            url: "/getIDOfIndex/announcements",
            data: {
                value: pos,
            },
            success: function (data) {
				$.ajax({
					type: "POST",
					url: "/deletefile/announcements",
					data:{
						value:data,
						file:fileid,
					},
					success:function(){
						window.location.reload();
					},
				});
			},
		});
	});	
	$('.deleteFileHomeworks').on('click', function (e) {
		let pos=$('.show_hide_homework').index($(this).closest('li'));
		let fileid=$('.file_homeworks').index($(this).closest('tr'));
		$.ajax({
			type: "POST",
            url: "/getIDOfIndex/homeworks",
            data: {
                value: pos,
            },
            success: function (data) {
				$.ajax({
					type: "POST",
					url: "/deletefile/homeworks",
					data:{
						value:data,
						file:fileid,
					},
					success:function(){
						window.location.reload();
					},
				});
			},
		});
	});	
	$('.deleteAllFilesAnnouncements').on('click', function (e) {
		let pos=$('.deleteAllFilesAnnouncements').index($(this));
		console.log(pos);
		$.ajax({
			type: "POST",
            url: "/getIDOfIndex/announcements",
            data: {
                value: pos,
            },
            success: function (data) {
				$.ajax({
					type: "POST",
					url: "/deleteallfiles/announcements",
					data:{
						value:data,
					},
					success:function(){
						window.location.reload();
					},
				});
			},
		});
	});
	$('.deleteAllFilesHomeworks').on('click', function (e) {
		let pos=$('.deleteAllFilesHomeworks').index($(this));
		$.ajax({
			type: "POST",
            url: "/getIDOfIndex/homeworks",
            data: {
                value: pos,
            },
            success: function (data) {
				$.ajax({
					type: "POST",
					url: "/deleteallfiles/homeworks",
					data:{
						value:data,
					},
					success:function(){
						window.location.reload();
					},
				});
			},
		});
	});		
	$('.uploadhomework').submit(function (e) {
		e.preventDefault();
		var formdata=new FormData();
		var pos=$('.show_hide_homework').index($(this).closest('li'));
		var header=$('.hwheader')[pos].innerHTML;
		formdata.append('header',header);
		pos=$('.uploadhomework').index($(this));
		var files=$('.hwupload')[pos].files;
		$.each(files,function(i,file){
			formdata.append('hwupload',file);
		});
		$.ajax({
			type: "POST",
			url:'/uploadhomework',
			data:formdata,
			processData:false,
			contentType:false,
			success: function (data) {
				window.location.reload();
			},
		});
	});	
});
$(document).ready(function () {
	var $parent = $(".results");
	$parent.on('click', '.deleteProject', function (e) {
        e.preventDefault();
		console.log("x");
        let pos = $(".deleteProject").index($(this));
		$.ajax({
			type: "POST",
			url: "/delete/projects",
			data: {
				value:project_data[pos]["_id"],
			},
			success: function (data) {
				window.location.reload();
			},
		});				
    });    
	$parent.on('submit', '.updateProject', function (e) {
        e.preventDefault();
		let pos = $(".updateProject").index($(this));
		var new_title=$('.new_title')[pos].value;
		var new_advisor=$('.new_advisor')[pos].value;
		$.ajax({
            type: "POST",
			url: "/update/projects",
			data:{
				id:project_data[pos]["_id"],
				new_title:new_title,
				new_advisor:new_advisor,
			},
			success: function (data) {
				window.location.reload();
			},
		});
	});
	$parent.on('click', '.deleteAllProjects', function (e) {
		$.ajax({
            type: "POST",
            url: "/deleteall/projects",
			success:function(){
				window.location.reload();
			},
		});
	});
});		
function toggle_password() {
  var x = $("#password");
  var y = $("#togglePassword");
  if (x.attr('type') == "password") {
    x.attr('type',"text");
    y.attr('class',"fa fa-eye-slash");
  } else {
    x.attr('type',"password");
    y.attr('class',"fa fa-eye");}
}
function show_hide(a,b) {
  let id=$(b).attr('id');
  let pos=$('[id="'+id+'"]').index($(b));
  console.log(pos);
  var x = $('.'+a)[pos];
  if (x.style.display === "none") {
  x.style.display = "block";}
  else {
		x.style.display = "none";
	}
}