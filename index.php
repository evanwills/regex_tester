<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Regex debugger (es5 with PHP fallback)</title>
		<link href="stylesheets/regex.css" rel="stylesheet" />
<!--
		<link href="bootstrap-3.3.6-dist/css/bootstrap-theme.css" rel="stylesheet" />
		<link href="regex.css" rel="stylesheet" />
-->
	</head>
	<body>
		<header>
			<h1>Regex tester</h1>
			<!-- <h2>(es5 with PHP fallback)</h2> -->
		</header>
		<form id="regex" method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">

			<div class="tab-content">
<?php
require_once('HTML-includes/input.tab.html');
require_once('HTML-includes/regex-pairs.tab.html');
require_once('HTML-includes/matches.tab.html');
require_once('HTML-includes/output.tab.html');
?>
			</div>

<?php
require_once('HTML-includes/settings.modal.html');
require_once('HTML-includes/submit.fixed.html');
?>

		</form>

<!-- START: templates -->

		<div id="templates" class="hide">
			<div id="instance">
<?php require_once('HTML-includes/templates/regex-pair.tmpl.html'); ?>
			</div>
			<div id="find-input">
<?php require_once('HTML-includes/templates/find-input.tmpl.html'); ?>
			</div>
			<div id="find-textarea">
<?php require_once('HTML-includes/templates/find-textarea.tmpl.html'); ?>
			</div>
			<div id="replace-input">
<?php require_once('HTML-includes/templates/replace-input.tmpl.html'); ?>
			</div>
			<div id="replace-textarea">
<?php require_once('HTML-includes/templates/replace-textarea.tmpl.html'); ?>
			</div>
			<div id="regex-engine-item">
<?php require_once('HTML-includes/templates/regex-engine-item.tmpl.html'); ?>
			</div>
			<div id="match-sample-item">
<?php require_once('HTML-includes/templates/match-sample-item.tmpl.html'); ?>
			</div>
			<div id="match-sample">
<?php require_once('HTML-includes/templates/match-sample.tmpl.html'); ?>
			</div>
			<div id="match-regex">
<?php require_once('HTML-includes/templates/match-regex.tmpl.html'); ?>
			</div>
		</div>

<!--  END:  templates -->

		<!-- <a href="<?php echo $_SERVER['REQUEST_URI']; ?>" rel="sidebar" title="Regex Debugger (JS/PHP)">Install as sidebar</a> -->

<?php
require_once('HTML-includes/footer-js.html');
?>

	</body>
</html>
