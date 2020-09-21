class DataTable
{
    constructor(selector)
    {
        this.table = $(selector);
    }

    row(rowID)
    {
        return this.table.find("tbody tr").eq(rowID);
    }

    rows()
    {
        return this.table.find("tbody tr");
    }

    cell(row, colID)
    {
        if (Number.isFinite(row))
            row = this.row(row);

        return $(row).find("td").eq(colID);
    }

    cellFloat(row, colID)
    {
        return parseFloat(this.cell(row, colID).text());
    }

    cellInt(row, colID)
    {
        return parseInt(this.cell(row, colID).text());
    }

    ratioNewToRecovered(row)
    {
        var r = Math.ratioNewToRecovered(
            this.cellFloat(row, Config.colIDs.ACTIVE)    - this.cellFloat(row, Config.colIDs.ACTIVE_LAST), 
            this.cellFloat(row, Config.colIDs.RECOVERED) - this.cellFloat(row, Config.colIDs.RECOVERED_LAST)
        );
        return Number.isFinite(r) ? r : 0;
    }

    val(row, colID)
    {
        return this.cell(row, colID).text();
    }

    valNumeric(row, colID)
    {
        return Number(this.cell(row, colID).text());
    }

    updateCell(row, colID, value)
    {
        var colInfo = Config.columnInfo(colID);

        var $cell = this.cell(row, colID);
        $cell.text(value);
        $cell.updateSortVal(value);
        var val = parseFloat(value);

        if ($cell[0] != undefined && colInfo != undefined && colInfo.low != null && colInfo.medium != null && colInfo.high != null)
            $cell[0].className = val < colInfo.low ? 'zero' : (val < colInfo.medium ? 'low' : (val < colInfo.high ? 'medium' : 'high'));
    }

    updateRow(row)
    {
        if (Number.isFinite(row))
            row = this.row(row);

        var cols = Config.columns();

        for (var i = 0; i < cols.length; i++)
        {
            if (cols[i].onUpdate != null)
                this.updateCell(row, i,  cols[i].onUpdate(this, row));
            else
                this.updateCell(row, i,  this.cell(row, i).text());
        }
        
        formatToolTip(this, row);
    }

    updateData(row, population, infections, infectionsLast, fatalities, fatalitiesLast, recovered, recoveredLast, active, activeLast)
    {
        this.updateCell(row, Config.colIDs.POPULATION, population);
        this.updateCell(row, Config.colIDs.INFECTIONS, infections);
        this.updateCell(row, Config.colIDs.INFECTIONS_LAST, infectionsLast);
        this.updateCell(row, Config.colIDs.DEATHS, fatalities);
        this.updateCell(row, Config.colIDs.DEATHS_LAST, fatalitiesLast);
        this.updateCell(row, Config.colIDs.RECOVERED, recovered);
        this.updateCell(row, Config.colIDs.RECOVERED_LAST, recoveredLast);
        this.updateCell(row, Config.colIDs.ACTIVE, active);
        this.updateCell(row, Config.colIDs.ACTIVE_LAST, activeLast);
        this.updateRow(row);
    }

    getSortInfo()
    {
        var asc = this.table.find("thead th.sorting-asc").index();
        var desc = this.table.find("thead th.sorting-desc").index();

        return { 
            "index":        asc == desc ? 8 : Math.max(asc, desc),  
            "direction":    desc >= asc ? 'desc' : 'asc'
        };
    }

    sort(index, direction)
    {
        this.table.find("thead th").eq(index).stupidsort(direction);
    }

    initStupidTable()
    {
        this.table.stupidtable_settings(
            { 
                "will_manually_build_table": true 
            }
        );
        this.table.bind(
            'aftertablesort', 
            function (event, data) 
            { 
                CoronaTracker.updateSort(true); 
            }
        );
        this.table.stupidtable_build(); 
    }
}
