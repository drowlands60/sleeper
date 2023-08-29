const axios = require("axios");

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

const prompt = require('prompt-sync')({sigint: true});

(async () => {

    let user = prompt('Enter a username:\n');


    const id = await (async () => {
        const {status, data} = await axios({
            method: 'get',
            url: `https://api.sleeper.app/v1/user/${user}`,
        });
        return data.user_id
    })();

    const leagues = await (async () => {
        const {status, data} = await axios({
            method: 'get',
            url: `https://api.sleeper.app/v1/user/${id}/leagues/nfl/2023`,
        });
        return data
    })();

    // let playerIds = await (async () => {
    //     readline.question(`Enter the number league to get roster\n`, async count => {
    //         readline.close();
    //         let leagueId = leagues.filter(league => {return league.leagueCount === parseInt(count)})[0].league_id;
            
    //         const roster = await (async () => {
    //             const {status, data} = await axios({
    //                 method: 'get',
    //                 url: `https://api.sleeper.app/v1/league/${leagueId}/rosters`,
    //             });
    //             return data.filter(r => {return r.owner_id === id})[0];
    //         })();  

    //         return({starters: roster.starters, players: roster.players});
    //     })
    //     console.log()
    // })();

    makeChoice(user, id, leagues);
    
    

})();

const viewRoster = async (user, id, leagues) => {
    console.log(`USER: ${user}\n\n`);
    let leagueCount = 0
    leagues.forEach(league => {
        leagueCount++
        league.leagueCount = leagueCount;
        console.log(league.leagueCount, ` - ${league.name}`);
    });

    let count = prompt(`Enter the number league to get roster\n`);
    let leagueId = leagues.filter(league => {return league.leagueCount === parseInt(count)})[0].league_id;
    const roster = await (async () => {
        const {status, data} = await axios({
            method: 'get',
            url: `https://api.sleeper.app/v1/league/${leagueId}/rosters`,
        });
        return data.filter(r => {return r.owner_id === id})[0];
    })();  

    const nfl = await (async () => {
        const {status, data} = await axios({
            method: 'get',
            url: `https://api.sleeper.app/v1/players/nfl`,
        });
        return data;
    })();  

    const squad = roster.players.map(player => {
        const {full_name, position, team} = nfl[player];
        return `${full_name}, ${position}, ${team}`
    });

    const starters = roster.starters.map(player => {
        const {full_name, position, team} = nfl[player] ? nfl[player] : {"full_name": "Empty", "position": "", "team": ""};
        return `${full_name}, ${position}, ${team}`
    });

    console.log("\n*******Squad:*******\n")
    squad.forEach(x => console.log(x));
    console.log("\n*******Starters:*******\n")
    starters.forEach(x => console.log(x));
    console.log("\n************************\n\n\n");
};

const makeChoice = async (user, id, leagues) => {
    const options = "\n\n1 - View a roster\n2 - null"
     let choice = prompt('Choose a function:' + options + "\n");
     switch(choice) {
         case "1":
         await viewRoster(user, id, leagues)
         break;
         case "2":
         console.log("this is null, dickhead")
         break;
         default:
         // code block
     }
     makeChoice(user, id, leagues)
 };
