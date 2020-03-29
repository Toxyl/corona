<html>
	<head>
		<title>COVID-19 Data</title>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/stupidtable/1.1.3/stupidtable.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.4/clipboard.min.js"></script>
		<link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Overpass+Mono&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
		<link rel="stylesheet" type="text/css" href="css/style.css">
		<script src="js/corona.js"></script>
		<script src="js/copy_button.js"></script>
	</head>
	<body>
		<h1 class="full-width shadow">COVID-19 Data</h1>
		<p class="full-width black-box-header shadow">
			Click on the column headers to change the sorting (default is <b>fatality rate</b>).<br>
			You can search for multiple countries by separating the (partial) names with commas.<br>
			Share view: <span id="url"></span> <span id='cpbtn' data-clipboard-target='#url' data-clipboard-text-copy="copy" data-clipboard-text-copied="copied"></span><br>
			<br>
		</p>
		<div class="full-width">
		<?php require_once "html/index.php"; ?>
		</div>
		<div class="full-width shadow" style="background-color: #6b6b6b; height: 122px;margin-top: 10px;">
			<p style="float: left;text-align: right;padding-left: 20px;">
				Be aware that all percentages are only estimates and <b>will not</b> reflect the entire reality of it.<br>
				The <i>chance of infection</i> is based on meeting <b>one</b> person, but the more you meet, the higher your risk becomes (see <b>Infection Chance</b> columns).<br>
				The given <i>fatality</i> is based on data reported by medical institutions world-wide, it <b>does not</b> say anything about the <i>fatality</i> if medical care is not available.<br>
				Changes are in regards to the previous data point. In countries where the virus is just starting to spread these numbers won't be very accurate.<br>
				The data is updated every hour using the <a href="https://github.com/ExpDev07/coronavirus-tracker-api">Coronavirus Tracker API</a>.
			</p>
			<pre style="float: left;text-align: left;padding-left: 20px;">
Formulas Used
----------------------------------------------------------------------------	
fatality rate        =  (fatalities / infected) * 100
chance of infection  = ((infected / population) * people met) * 100
change of infections = ((infections current / infections last) - 1) * 100
change of fatalities = ((fatalities current / fatalities last) - 1) * 100
			</pre>
		</div>
		<script>
			refreshData();
			attachCopyHandler('#cpbtn');
		</script>
	</body>
</html>
