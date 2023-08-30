const axios = require("axios");

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

const prompt = require('prompt-sync')({sigint: true});

(async () => {
    console.log('Enter a username:\n')
    let user = prompt("");


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
    console.log(`\n\nUSER: ${user}\n`);
    let leagueCount = 0
    leagues.forEach(league => {
        leagueCount++
        league.leagueCount = leagueCount;
        console.log(league.leagueCount, ` - ${league.name}`);
    });

    console.log(`Enter the number league to get roster\n`);
    let count = prompt("");
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

const getFavourites = async (user, id, leagues) => {

    allPlayers = [];
    for (let i = 0; i < leagues.length; i++) {
        console.log("Calculating...")
        const roster = await ( async () => {
            const {status, data} = await axios({
                method: 'get',
                url: `https://api.sleeper.app/v1/league/${leagues[i].league_id}/rosters`,
            });
            return await data.filter(r => r.owner_id === id);
        })();
        allPlayers.push(...roster[0].players);
    }
   
    let tally = {};
    allPlayers.forEach(player => {
        tally[player] = tally[player] ? tally[player] + 1 : 1 ;
    })
    
    const getTopPlayers = tally => {
        const topPlayers = {};
        if (Object.keys(tally).length < 10) {
            return false
        }
        Object.keys(tally).sort((a, b) => tally[b] - tally[a]).forEach((key, ind) => {
            if(ind < 10){
                topPlayers[key] = tally[key];
            }
        });
        return topPlayers;
    }

   const topPlayers = getTopPlayers(tally);

    const nfl = await (async () => {
        const {status, data} = await axios({
            method: 'get',
            url: `https://api.sleeper.app/v1/players/nfl`,
        });
        return data;
    })(); 

    const formattedPlayers = {}
    Object.keys(topPlayers).forEach(player => {
        const {full_name, position, team} = nfl[player] ? nfl[player] : {"full_name": "Empty", "position": "", "team": ""};
        // return `${full_name}, ${position}, ${team}: on ${tally[player]} teams`
        formattedPlayers[full_name] = {Position: position, Team: team, "# of Rosters": tally[player]}}
    );
    
    const ordered = Object.keys(formattedPlayers);

    ordered.sort((a, b) => {
        if (formattedPlayers[a]["# of Rosters"] < formattedPlayers[b]["# of Rosters"]) {
            return 1
        } else if (formattedPlayers[a]["# of Rosters"] > formattedPlayers[b]["# of Rosters"]) {
            return -1
        }
        return 0
    });

    const final = {};
    
    ordered.forEach(o => {
        final[o] = formattedPlayers[o];
    });
    
    console.table(final);
};

const makeChoice = async (user, id, leagues) => {
    const options = "\n\n1 - View a roster\n2 - Get favourite players"
    console.log("Choose a function:" + options + "\n");
     let choice = prompt("");
     switch(choice) {
         case "1":
            await viewRoster(user, id, leagues)
            break;
         case "2":
            await getFavourites(user, id, leagues)
            break;
         default:
            console.log("\nEnter a valid choice\n")
            break;
         // code block
     }
     makeChoice(user, id, leagues)
 };
