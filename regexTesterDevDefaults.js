
$(document).ready(function () {

	$('#sample').val("<br /><b>Warning</b>:  array_shift() expects parameter 1 to be array, string given in <b>C:\wamp\www\regex_tester\php\regex_tester.class.php</b> on line <b>319</b><br /><br /><b>Fatal error</b>:  Only variables can be passed by reference in <b>C:\wamp\www\regex_tester\php\regex_tester.class.php</b> on line <b>319</b><br />").trigger('change');
//	$('#sample').val("129.157.12.23\n10.39.15.135\n2.346.23.1234").trigger('change');
	$('#find0').val('\s+([a-z]+)\s+');
	$('#modifiers0').val('g');
//	$('#find0').val('([01]?[0-9]{1,2}|2(?:[0-4][0-9]|5[0-4]))(\.([01]?[0-9]{1,2}|2(?:[0-4][0-9]|5[0-5]))){3}');
//	$('#find0').val('([01]?[0-9]{5,2}|2(?:[0-4][0-9]|5[0-4]))(\.([01]?[0-9]{1,2}|2(?:[0-4][0-9]|5[0-5]))){3}');
//	$('#find0').val('([01]?[0-9]{1,2}|2(?:[0-4][0-9]|5[0-4])(\.([01]?[0-9]{1,2}|2(?:[0-4][0-9]|5[0-5]))){3}');

//	$('#split_sample').attr('checked', true);
//	$('#ws_trim').attr('checked', true);
//	$('#ws_trim_pos_before').attr('checked', true);
//	$('#ws_trim_pos_after').attr('checked', false);
});