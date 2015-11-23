function vowel() {
    return ['a', 'e', 'i', 'o', 'u', 'y'];
}

function consonant() {
    return ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z'];
}

function getRand(alphabet) {
	var index = Math.floor(Math.random() * alphabet.length);
    return alphabet[index];
}

var cons = getRand(consonant());
var str = getRand(consonant())+getRand(vowel())+cons+cons+'r';
alert(str);
