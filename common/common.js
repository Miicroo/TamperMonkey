Date.prototype.yyyymmdd = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
	var dd = this.getDate().toString();
	return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
};

function generateGuidList(listLength) {
    guids = [];
    for(i = 0; i<listLength; i++) {
        guids.push(guid());
    }
    return guids;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +s4() + '-' + s4() + s4() + s4();
}

function download(data, filename) {
    var hiddenLink = document.createElement('a');

    hiddenLink.href = 'data:attachment/text,' + encodeURI(data);
    hiddenLink.target = '_blank';
    hiddenLink.download = filename;
    hiddenLink.click();
}
