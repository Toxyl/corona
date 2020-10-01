class TimelinesDataColumn
{	
	static formatters = {
		string:  function(a) { return a.toString().appendCountryCode(); },
		int:     function(a) { return parseFloat(a).toFixed(0); },
		float:   function(a) { return parseFloat(a).toFixed(2); },
		percent: function(a) { return (parseFloat(a).toFixed(4) * 100).toFixed(2) + '%'; },
	};

	constructor(country, alias, type, thresholds, formatter) {
		this.name = country;
		this.alias = alias;
		this.type = type;
		this.thresholds = thresholds == undefined ? {} : thresholds;
		this.formatter = TimelinesDataColumn.formatters[type];
	}

	addThreshold(value, cssClass) {
		this.thresholds[value] = cssClass;
		return this;
	}

	format(value) {
		return this.formatter != undefined ? this.formatter(value) : value;
	}

	getClass(value) {
		var ranges = ObjectUtils.keys(this.thresholds).sort(function(a,b) { return a - b; });
		var metricClass = this.thresholds[ranges[ranges.length-1]] == undefined ? 'none' : this.thresholds[ranges[ranges.length-1]];
		for (var k = 0; k < ranges.length; k++) {			
			if (value < parseFloat(ranges[k])) {
				metricClass = this.thresholds[ranges[k]];
				break;
			}
		}
		return metricClass;
	}

	html(value) {
		return "<td class='"+this.getClass(value)+"'>"+this.format(value)+"</td>";
	}
}

class TimelinesDataColumns
{
	static columns = [
		new TimelinesDataColumn('Country',						'country', 							'string'),
		new TimelinesDataColumn('Population', 					'population', 						'int'),
		new TimelinesDataColumn('Infections (total)', 			'total.infected', 					'int', 		{ 0: 'zero', 1000: 'low',      10000: 'medium',      100000: 'high', }),
		new TimelinesDataColumn('Active (total)', 				'total.active', 					'int', 		{ 0: 'zero', 1000: 'low',      10000: 'medium',      100000: 'high',        "-100000": 'high-good', "-10000": 'medium-good', "-1000": 'low-good'  }),
		new TimelinesDataColumn('Recovered (total)', 			'total.recovered',					'int', 		{ 0: 'zero', 1000: 'low-good', 10000: 'medium-good', 100000: 'high-good' }),
		new TimelinesDataColumn('Deaths (total)', 				'total.deaths', 					'int', 		{ 0: 'zero', 1000: 'low',      10000: 'medium',      100000: 'high' }),
		new TimelinesDataColumn('Infections (change)', 			'relative_change.infected', 		'percent', 	{ 0: 'zero', 1000: 'low',      10000: 'medium',      100000: 'high' }),
		new TimelinesDataColumn('Active Cases (change)', 		'relative_change.active', 			'percent', 	{ 0: 'zero', 1000: 'low',      10000: 'medium',      100000: 'high',        "-100000": 'high-good', "-10000": 'medium-good', "-1000": 'low-good' }),
		new TimelinesDataColumn('Recovered (change)', 			'relative_change.recovered', 		'percent',	{ 0: 'zero', 1000: 'low-good', 10000: 'medium-good', 100000: 'high-good' }),
		new TimelinesDataColumn('Deaths (change)', 				'relative_change.deaths', 			'percent', 	{ 0: 'zero', 1000: 'low',      10000: 'medium',      100000: 'high' }),
		new TimelinesDataColumn('New Cases / Recovered', 		'total.new_cases_per_recovered', 	'float', 	{ 0: 'zero', 1000: 'low',      10000: 'medium',      100000: 'high' }),
		new TimelinesDataColumn('Case Fatality Rate', 			'total.case_fatality_rate', 		'percent', 	{ 0: 'zero', "0.01": 'low',   "0.03": 'medium',      "0.05": 'high' }),
		new TimelinesDataColumn('Infection Chance (1+ ppl)', 	'total.infection_chance', 			'percent', 	{ 0: 'zero', "0.10": 'low',   "0.25": 'medium',      "0.50": 'high' }),
		new TimelinesDataColumn('Infection Chance (10+ ppl)', 	'total.infection_chance_10', 		'percent', 	{ 0: 'zero', "0.10": 'low',   "0.25": 'medium',      "0.50": 'high' }),
		new TimelinesDataColumn('Infection Chance (50+ ppl)', 	'total.infection_chance_50', 		'percent', 	{ 0: 'zero', "0.10": 'low',   "0.25": 'medium',      "0.50": 'high' }),
		new TimelinesDataColumn('Infection Chance (100+ ppl)',  'total.infection_chance_100', 		'percent',	{ 0: 'zero', "0.10": 'low',   "0.25": 'medium',      "0.50": 'high' }),
	];

	static findColumnIndex(dataColumn) {
		var colIndex = 0;
		for (colIndex; colIndex < TimelinesDataColumns.columns.length; colIndex++) {
			if (TimelinesDataColumns.columns[colIndex] == dataColumn)
				break;
		}
		return colIndex;
	}

	static columnByIndex(i) {
		return TimelinesDataColumns.columns[i];
	}
}

class TimelinesData
{
	resolveMetric(c, column) {
		var metric = column.alias.split('.');
		var metricSection = metric.length == 2 ? metric[0] : undefined;
		var metricName = metric.length == 2 ? metric[1] : metric[0];
		metric = metricSection != undefined ? c.latest[metricSection][metricName] : c[metricName];
		metric = column.type == 'string' ? metric : parseFloat(metric);
		return column.type == 'string' ? metric : (Number.isFinite(metric) ? metric : 0);
	}

	constructor(timelines) {
		this.header = [];
		this.data = [];
		
		for (var i = 0; i < TimelinesDataColumns.columns.length; i++) {
			this.header.push(TimelinesDataColumns.columns[i].name);
		}

		var countries = ObjectUtils.keys(timelines);
		var c;

		for (var i = 0; i < countries.length; i++) {
			c = timelines[countries[i]];
			if (c != undefined && c.population != null && c.population > 0) {
				var row = [ ];
				for (var j = 0; j < TimelinesDataColumns.columns.length; j++) {
					row.push(this.resolveMetric(c, TimelinesDataColumns.columns[j]));
				}
				this.data.push(row);
			}
		}
	}

	sort(index, direction) {
		if (index == undefined && direction == undefined) {
			var url = URL.get();
			index = url.sort.index;
			direction = url.sort.direction;
		}

		if (direction == undefined)
			direction = 'asc';

		this.sortInfo = {
			index: index,
			direction: String(direction).toLowerCase()
		};
		if (TimelinesDataColumns.columnByIndex(index).type == 'string') {
			if (this.sortInfo.direction == 'asc') { this.data.sort((a, b) => String(a).localeCompare(String(b))); }
			else                                  { this.data.sort((a, b) => String(b).localeCompare(String(a))); }
		}
		else {
			if (this.sortInfo.direction == 'asc') { this.data.sort((a, b) => a[index] - b[index]); }
	        else                   			      { this.data.sort((a, b) => b[index] - a[index]); }			
		}

        return this;
	}

	filter(index, filter) {
		if (filter == undefined) {
			var url = URL.get();
			filter = url.filter;
		}

		this.visible = [];

		if (TimelinesDataColumns.columnByIndex(index).type == 'string') {
			for (var i = 0; i < this.data.length; i++) {
				this.visible[i] = filter == '' || String(this.data[i][index].appendCountryCode()).isInList(filter);
			}
		} else {
			filter = filter == '' ? undefined : filter.replace(/[^=<>]*([=<>]{1,2})\s*(\d+\.{0,1}\d*)\D*/, '$1||$2').split('||');
			for (var i = 0; i < this.data.length; i++) {
				this.visible[i] = filter == undefined || Number(parseFloat(this.data[i][index])).compare(filter[0], filter[1]);
			}
		}

		return this;
	}

	findRowIndex(columnIndex, value) {
		for (var i = 0; i < this.data.length; i++) {
			if (this.data[i][columnIndex] == value)
				return i;
		}
		return -1;
	}
}
