class CoronaTracker
{
    static update(callback)
    {
        var loadData = function (data)
        {
            CoronaTracker.timelines = new TimelinesAdapterOWID(data);
            CoronaTracker.timelinesData = new TimelinesData(CoronaTracker.timelines);
            callback();
        };

        $.getJSON(Config.apiURL, loadData);
    }

    static scheduleUpdate(timeFirst, timeNext)
    {
        setTimeout(function(){
            console.log('Running update...');
            CoronaTracker.update(
                function()
                {
                    TimelinesTable.generate(CoronaTracker.timelinesData.sort().filter(0), true);
                }
            );
            CoronaTracker.scheduleUpdate(timeNext, timeNext);
        }, timeFirst);
    }
}
