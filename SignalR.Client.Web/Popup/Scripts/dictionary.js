var dictionaryTree = $('ul#dict').treeview({
    collapsed: true,
    control: "#sidetreecontrol"
});
$('div#SASHADictionary').parent().css('background-image', 'none');
dictionaryTime = new Date().toString();
dictionaryTime = toLocalTime(dictionaryTime);
$('div.dictionaryInfo').html(dictionaryTime).removeClass('hidden');
$('div.dictionary').removeClass('pending hidden');
