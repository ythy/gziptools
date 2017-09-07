var pako = require('pako');
var Base64 = require('js-base64').Base64;
var path = require('path');

var cdw_path = process.cwd()
	,out_path;


var walk = require('walk')
    , fs = require('fs')
    , options
    , walker;

var list_path = [];
var list_path_file = [];

exports.doWalk = doWalk; 

function doWalk(cdflag, outfolder)
{
	out_path = cdw_path + '\\' + outfolder;
	console.log("操作目录 ： " + cdw_path);
	console.log("输出目录 ： " + out_path);
	if(cdflag)
	{
		walker = walk.walk(cdw_path, options);
		walker.on("file", function (root, fileStats, next) {
			addArrayItem(root, fileStats.name);
		    next();
	  	});
	  	walker.on("end", function () {
	  		doRead();
		});
	}
	else
	{
		var files = fs.readdirSync(cdw_path);
        files.forEach(function(item) {  
            var tmpPath = cdw_path + '\\' + item,
                stats = fs.statSync(tmpPath);
            
            if (!stats.isDirectory()) 
            	 addArrayItem(cdw_path, item);
        });  
		doRead();
	}
}

function addArrayItem(root, filename)
{
	if(path.extname(filename) == '.json' && root.indexOf(out_path) == -1)
	{
		list_path.push(root);
   		list_path_file.push(filename);
   	}
}

function doRead()
{
	var count = list_path.length;
	read(--count);
}

function read(count)
{
	if(count < 0)
		return;
	var root = 	list_path[count];
	var fileStats = list_path_file[count];
 	fs.readFile(root + '\\' + fileStats, 'utf-8', function (err, data) {
  			var output =  Base64.encode(pako.gzip(data, {to : "string"}));
			var outfilepath = out_path + "\\" + root.substr(cdw_path.length);
			mkdirs(outfilepath, 0777, function(){
				fs.writeFile(outfilepath + fileStats, output, function (err, data) {
					 if(err) {
	               		 console.error(err);
		            } else {
		                console.log('写入成功 : ' + outfilepath + fileStats);
		            }
				});
				read(--count);
			});
    });
}


function mkdirs(dirpath, mode, callback) {
    fs.exists(dirpath, function(exists) {
        if(exists) {
            callback(dirpath);
        } else {
            //尝试创建父目录，然后再创建当前目录
            mkdirs(path.dirname(dirpath), mode, function(){
                    fs.mkdir(dirpath, mode, callback);
            });
        }
    });
};


  