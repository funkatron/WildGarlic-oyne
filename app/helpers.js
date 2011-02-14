var nl2br = function(str, breaktag) {

	breaktag = breaktag || '<p></p>';

	str = str.replace(/(\r\n|\n\r|\r|\n)/g, breaktag+'$1');
	return str;
}
