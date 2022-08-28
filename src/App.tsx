import { Autocomplete, Box, Button, Grid, Paper, styled, TextField } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import useWindowDimensions from './Tools/Window';
import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { Auth, API } from 'aws-amplify';
import { listUsers } from './graphql/queries';
import { createUser as createUserMutation, updateUser as updateUserMutation } from './graphql/mutations';
import { GraphQLResult } from '@aws-amplify/api';

// Interface for a player
interface Player {
  label: string,
  overall: number,
  pace: number,
  shooting: number,
  passing: number,
  dribbling: number,
  defending: number,
  physical: number
}

// Interface for a user
interface User {
  id?: string,
  username: string,
  score: number,
}

// Interface for AppProps
interface AppProps {
  signOut?: any,
}

function App(props?: AppProps) {

  // Holds array from api
  const [apiArray, setApiArray] = useState<any>();
  // Holds list of all players
  const [playerList, setPlayerList] = useState<Player[]>([]);
  // Holds list of all users
  const [userList, setUserList] = useState<User[]>([]);
  
  // List of all footballers
  const playerListManual: Player[] = [
    {label: 'Lionel Messi', overall: 93, pace: 85, shooting: 92, passing: 91, dribbling: 95, defending: 34, physical: 60},
    {label: 'Robert Lewandowski', overall: 92, pace: 78, shooting: 92, passing: 79, dribbling: 86, defending: 44, physical: 82},
    {label: 'Cristiano Ronaldo', overall: 91, pace: 87, shooting: 94, passing: 80, dribbling: 88, defending: 34, physical: 75},
    {label: 'Neymar Jr', overall: 91, pace: 91, shooting: 83, passing: 86, dribbling: 94, defending: 37, physical: 63},
    {label: 'Kevin De Bruyne', overall: 91, pace: 76, shooting: 86, passing: 93, dribbling: 88, defending: 64, physical: 78},
    {label: 'Kylian Mbappe', overall: 91, pace: 97, shooting: 88, passing: 80, dribbling: 92, defending: 36, physical: 77},
    {label: 'Harry Kane', overall: 90, pace: 70, shooting: 91, passing: 83, dribbling: 83, defending: 47, physical: 83},
    {label: 'Ngolo Kante', overall: 89, pace: 78, shooting: 66, passing: 75, dribbling: 82, defending: 87, physical: 83},
    {label: 'Karim Benzema', overall: 89, pace: 76, shooting: 86, passing: 81, dribbling: 87, defending: 39, physical: 77},
    {label: 'Heung Min Son', overall: 89, pace: 88, shooting: 87, passing: 82, dribbling: 86, defending: 43, physical: 69},
  ];

  // Holds player to guess
  const [correctPlayer, setCorrectPlayer] = useState<Player>(playerList[Math.floor(Math.random()*playerList.length)]);
  // Holds if user has finished
  const [finished, setFinished] = useState<string>('');

  // Holds guessed players
  const [guessedPlayers, setGuessedPlayers] = useState<Player[]>([
    {label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0},
    {label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0},
    {label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0},
    {label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0},
    {label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0},
  ]);

  // Variables to store current selected stats
  const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>(undefined);
  const [currentOverall, setCurrentOverall] = useState<string>('');
  const [currentPace, setCurrentPace] = useState<string>('');
  const [currentShooting, setCurrentShooting]  = useState<string>('');
  const [currentPassing, setCurrentPassing] = useState<string>('');
  const [currentDribbling, setCurrentDribbling]  = useState<string>('');
  const [currentDefending, setCurrentDefending]  = useState<string>('');
  const [currentPhysical, setCurrentPhysical]  = useState<string>('');

  // Holds dialog property for instructions
  const [instructionsOpen, setInstructionsOpen] = useState<boolean>(false);
  // Holds dialog property for win
  const [winOpen, setWinOpen] = useState<boolean>(false);
  // Holds dialog property for lose
  const [loseOpen, setLoseOpen] = useState<boolean>(false);
  // Holds dialog property for leaderboard
  const [leaderboardOpen, setLeaderboardOpen] = useState<boolean>(false);
  // Holds current user if they are in the database
  const [currentUser, setCurrentUser] = useState<User>({id: "", username: "", score: 0});

  // Holds height and width of screen
  const { height, width } = useWindowDimensions();

  const Item: any = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    verticalAlign: 'center',
    color: theme.palette.text.secondary,
    fontSize: 14,
    height: 40,
  }));

  const ItemBlue: any = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : theme.palette.primary.main,
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    verticalAlign: 'center',
    color: 'white',
    fontSize: 13,
    height: 40,
  }));

  // Retreives json from api
  async function apiCall() {
    try {
      const query = await fetch('https://r90ugk5s0f.execute-api.us-east-1.amazonaws.com/players', {method: 'GET'});
      const json = await query.json()
      if (apiArray === undefined) {
        setApiArray(json);
      }
      // Retrieve the user's username
      Auth.currentAuthenticatedUser().then((user) => {
        const currentUsername: string = user.username.charAt(0).toUpperCase() + user.username.slice(1);
        setCurrentUser({ id: currentUser.username, username: currentUsername , score: 0});
      });
    }
    catch (e) {
      console.log(e);
    }
  }

  // Renders the fetch users on first render
  useEffect(() => {
    fetchUsers();
  }, []);

  // Setup the players array by calling the api
  useEffect(() => {
    // Update user list
    var newUserList: User[] = [...userList];
    newUserList = orderUserArray(newUserList);
    setUserList(newUserList);
    try {
      apiCall();
      // Create the list of players from api array
      var newPlayerList: Player[] = []
      if (apiArray !== undefined) {
        const newApiArray = apiArray.filter((x: any) => x.positions !== 'GK');
        newPlayerList = newApiArray.map((p: any) => {
          return (
            {label: p.name, overall: p.overall, pace: p.pace, shooting: p.shooting, passing: p.passing, 
              dribbling: p.dribbling, defending: p.defending, physical: p.physical }
          )
        });
        // Set player list
        setPlayerList(newPlayerList);
        // Set the correct player
        setCorrectPlayer((playerList[Math.floor(Math.random()*playerList.length)]));
      };
    }
    // Api not working
    catch (e) {
      // Set player list
      setPlayerList(playerListManual);
      // Set the correct player
      setCorrectPlayer((playerListManual[Math.floor(Math.random()*playerList.length)]));
    }
    // eslint-disable-next-line
  }, [apiArray])

  // Fetch all the users
  async function fetchUsers() {
    try {
      const apiData = await API.graphql({ query: listUsers }) as GraphQLResult<any>;
      // For loop to get usernames and scores
      const database: User[] = apiData.data.listUsers.items;
      var newDatabase: User[] = [];
      for (let i = 0; i < database.length; i++) {
        newDatabase[i] = { id: database[i].id, username: database[i].username, score: database[i].score };
      }
      
      setUserList(newDatabase);
      console.log("Database");
      console.log(newDatabase);
    }
    catch (e) {
      // Data storage doesn't work so use manual list
       setUserList([
        {id: "1", username: "Robert", score: 5},
        {id: "2", username: "James", score: 7},
        {id: "3", username: "Kerry", score: 12},
        {id: "4", username: "Lauren", score: 2},
        {id: "5", username: "Bruce", score: 4},
        {id: "6", username: "Kyle", score: 11},
        {id: "7", username: "Jake", score: 9},
      ]);       
    }
  }

  // Create a new user
  async function createUser() {
    await API.graphql({ query: createUserMutation, variables: { input: {username: currentUser.username, score: 1} } });
    const newUserList: User[] = [ ...userList, {username: currentUser.username, score: 1} ];
    setUserList(orderUserArray(newUserList));
    setCurrentUser({ id: currentUser.username, username: currentUser.username, score: 1 });
  }

  // Update a user
  async function updateUser() {
    // Find if the user is in the database
    const current: number = userList.findIndex((user: User) => user.username === currentUser.username);
    // If user found
    if (current > -1) {
      // Add one to score
      var newUserList: User[] = [...userList];
      newUserList[current].score = Number(newUserList[current].score) + 1;
      await API.graphql({ query: updateUserMutation, variables: { input: {id: newUserList[current].id, username: currentUser.username, score: (Number(newUserList[current].score) + 1)} } });
      newUserList = orderUserArray(newUserList);
      setUserList(newUserList);
      setCurrentUser({ id: newUserList[current].id, username: currentUser.username, score: (Number(currentUser.score) + 1) });
    }
  }

  /*
  // Delete a user
  async function deleteUser(id: string) {
    const newUserList = userList.filter((user: User) => user.id !== id);
    setUserList(newUserList);
    await API.graphql({ query: deleteUserMutation, variables: { input: { id } }});
  }
  */

  // Orders an array of user's by score from highest to lowest
  function orderUserArray(array: User[]) {
    return array.sort((user1: User, user2: User) => user2.score - user1.score);
  }
  
  // On autocomplete change
  function autocompleteChange(value: Player | null) {
    // If null set all consts to null
    if (value === null) {
      setCurrentPlayer(undefined);
      setCurrentOverall('');
      setCurrentPace('');
      setCurrentShooting('');
      setCurrentPassing('');
      setCurrentDribbling('');
      setCurrentDefending('');
      setCurrentPhysical('');
    }
    // Else set to current player stats
    else {
      setCurrentPlayer(value);
      setCurrentOverall(value.overall.toString());
      setCurrentPace(value.pace.toString());
      setCurrentShooting(value.shooting.toString());
      setCurrentPassing(value.passing.toString());
      setCurrentDribbling(value.dribbling.toString());
      setCurrentDefending(value.defending.toString());
      setCurrentPhysical(value.physical.toString());
    }
  }

  // User guesses player
  function onGuess() {
    // Add to guessed players
    var newGuessedPlayers: Player[] = [...guessedPlayers];
    const index: number = newGuessedPlayers.findIndex((p: Player) => p.label === "Placeholder");
    newGuessedPlayers[index] = currentPlayer!;
    setGuessedPlayers(newGuessedPlayers);
    // Users selects correct player
    if (correctPlayer.label === currentPlayer!.label) {
      setFinished('W');
      setTimeout(() => setWinOpen(true), 500);
    }
    // User selects wrong
    else {
      // If out of guesses
      if (index === 4) {
        setFinished('L');
        setTimeout(() => setLoseOpen(true), 500);
      }
    }
  }

  // User clicks restart
  function onRestart() {
    // Pick new player
    setCorrectPlayer((playerList[Math.floor(Math.random()*playerList.length)]));
    // Reset variables
    setFinished('');
    setGuessedPlayers([
      {label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0},
      {label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0},
      {label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0},
      {label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0},
      {label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0},
    ]);
    setCurrentPlayer(undefined);
    setCurrentOverall('');
    setCurrentPace('');
    setCurrentShooting('');
    setCurrentPassing('');
    setCurrentDribbling('');
    setCurrentDefending('');
    setCurrentPhysical('');
  }

  // Determines colour of grid item
  function gridItemColour(value1: number, value2: number) {
    if (value1 < value2) {
      return 'lightgreen';
    }
    else if (value1 > value2) {
      return "#ffcccb";
    }
    else {
      return "yellow";
    }
  }

  // Update leaderboard array
  function onLeaderboardUpdate() {
    setWinOpen(false);
    // Find if the user is in the database
    const current: number = userList.findIndex((user: User) => user.username === currentUser.username);
    // If user found
    if (current > -1) {
      updateUser();
    }
    // Else add to the array
    else {
      createUser();
    }
  }

  // When leaderboard dialog is opened
  function onLeaderboardClick() {
    // Find if the user is in the database
    const index: number = userList.findIndex((user: User) => user.username === currentUser.username);
    if (index > -1) {
      setCurrentUser({ id: userList[index].id, username: currentUser.username, score: userList[index].score });
    }
    setLeaderboardOpen(true);
  }

  // Renders the leaderboard scores
  const leaderboard = useMemo(() => userList.map(
    (user: User, index: number) => {
      if (index < 5) {
        if (user.username === currentUser.username) {
          return ( 
            <>
              <Grid item xs={9}>
                <Item style={{backgroundColor: 'yellow'}}>{user.username}</Item>
              </Grid>
              <Grid item xs={3}>
                <Item style={{backgroundColor: 'yellow'}}>{user.score}</Item>
              </Grid>
            </>
          );
        }
        else {
          return ( 
            <>
              <Grid item xs={9}>
                <Item>{user.username}</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>{user.score}</Item>
              </Grid>
            </>
          );
        }
        
      }
      else {
        return null;
      }
    }
    // eslint-disable-next-line
  ), [userList, currentUser]);

  // Renders the guessed players
  const guesses = useMemo(() => guessedPlayers.map(
    (guess: Player) => {
      if (guess.label === "Placeholder") {
        return (
          <Grid container spacing={0.5} style={{paddingTop: 10}}>
            <Grid item xs={3}> <Item></Item>  </Grid>
            <Grid item xs={9/7}> <Item></Item> </Grid>
            <Grid item xs={9/7}> <Item></Item> </Grid>
            <Grid item xs={9/7}> <Item></Item> </Grid>
            <Grid item xs={9/7}> <Item></Item> </Grid>
            <Grid item xs={9/7}> <Item></Item> </Grid>
            <Grid item xs={9/7}> <Item></Item> </Grid>
            <Grid item xs={9/7}> <Item></Item> </Grid>
          </Grid>
        )
      }
      else {
        return (
          <Grid container spacing={0.5} style={{paddingTop: 10}}>
            <Grid item xs={3}>
              <Item>{guess.label}</Item>
            </Grid>
            <Grid item xs={9/7}>
              <Item style={{backgroundColor: gridItemColour(guess.overall, correctPlayer.overall)}}>{guess.overall}</Item>
            </Grid>
            <Grid item xs={9/7}>
              <Item style={{backgroundColor: gridItemColour(guess.pace, correctPlayer.pace)}}>{guess.pace}</Item>
            </Grid>
            <Grid item xs={9/7}>
              <Item style={{backgroundColor: gridItemColour(guess.shooting, correctPlayer.shooting)}}>{guess.shooting}</Item>
            </Grid>
            <Grid item xs={9/7}>
              <Item style={{backgroundColor: gridItemColour(guess.passing, correctPlayer.passing)}}>{guess.passing}</Item>
            </Grid>
            <Grid item xs={9/7}>
              <Item style={{backgroundColor: gridItemColour(guess.dribbling, correctPlayer.dribbling)}}>{guessedPlayers[0].dribbling}</Item>
            </Grid>
            <Grid item xs={9/7}>
              <Item style={{backgroundColor: gridItemColour(guess.defending, correctPlayer.defending)}}>{guess.defending}</Item>
            </Grid>
            <Grid item xs={9/7}>
              <Item style={{backgroundColor: gridItemColour(guess.physical, correctPlayer.physical)}}>{guess.physical}</Item>
            </Grid>
          </Grid>
        )
      }
    }
    // eslint-disable-next-line
  ), [guessedPlayers]);

  return (
    <div style={{height: height-1, width: width, overflow: 'hidden'}}>
      <header className="App-header" style={{height: height * 0.25, width: width}}>
        <h1 className="header">Footbordle</h1>
        <p>Wordle but for FIFA 22 players! Try to guess the FIFA footballer in 5 guesses to win!</p>
      </header>

      <section className="container" style={{height: height * 0.65, width: width}}>

        <div className="one" style={{height: height * 0.65, width: width/2 - 20, textAlign: 'center'}}>
          <h2>Past Guesses</h2>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={0.5}>
              <Grid item xs={3}>
                <ItemBlue><b>Name</b></ItemBlue>
              </Grid>
              <Grid item xs={9/7}>
                <ItemBlue><b>Overall</b></ItemBlue>
              </Grid>
              <Grid item xs={9/7}>
                <ItemBlue><b>Pace</b></ItemBlue>
              </Grid>
              <Grid item xs={9/7}>
                <ItemBlue><b>Shooting</b></ItemBlue>
              </Grid>
              <Grid item xs={9/7}>
                <ItemBlue><b>Passing</b></ItemBlue>
              </Grid>
              <Grid item xs={9/7}>
                <ItemBlue><b>Dribbling</b></ItemBlue>
              </Grid>
              <Grid item xs={9/7}>
                <ItemBlue><b>Defending</b></ItemBlue>
              </Grid>
              <Grid item xs={9/7}>
                <ItemBlue><b>Physical</b></ItemBlue>
              </Grid>
            </Grid>
            {guesses}
          </Box>
          
          {finished === "L" 
              ? <>
                <h2>Correct Player</h2>
                <Box sx={{ flexGrow: 1 }}>
                  <Grid container spacing={0.5} style={{paddingTop: 10}}>
                    <Grid item xs={3}>
                      <Item style={{backgroundColor: "yellow"}}>{correctPlayer.label}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item style={{backgroundColor: "yellow"}}>{correctPlayer.overall}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item style={{backgroundColor: "yellow"}}>{correctPlayer.pace}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item style={{backgroundColor: "yellow"}}>{correctPlayer.shooting}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item style={{backgroundColor: "yellow"}}>{correctPlayer.passing}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item style={{backgroundColor: "yellow"}}>{correctPlayer.dribbling}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item style={{backgroundColor: "yellow"}}>{correctPlayer.defending}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item style={{backgroundColor: "yellow"}}>{correctPlayer.physical}</Item>
                    </Grid>
                  </Grid>
                </Box>
              </>
              : null
            }
        </div>

        <div className="two" style={{height: height * 0.65, width: width/2, textAlign: 'center'}}>
          <h2 className='h2-pad'>Current Guess</h2>

          <Grid container spacing={0.5}>
              <Grid item xs={12/7}>
                <ItemBlue><b>Overall</b></ItemBlue>
              </Grid>
              <Grid item xs={12/7}>
                <ItemBlue><b>Pace</b></ItemBlue>
              </Grid>
              <Grid item xs={12/7}>
                <ItemBlue><b>Shooting</b></ItemBlue>
              </Grid>
              <Grid item xs={12/7}>
                <ItemBlue><b>Passing</b></ItemBlue>
              </Grid>
              <Grid item xs={12/7}>
                <ItemBlue><b>Dribbling</b></ItemBlue>
              </Grid>
              <Grid item xs={12/7}>
                <ItemBlue><b>Defending</b></ItemBlue>
              </Grid>
              <Grid item xs={12/7}>
                <ItemBlue><b>Physical</b></ItemBlue>
              </Grid>
            </Grid>

          <Grid container spacing={0.5} style={{paddingTop: 10}}>
              <Grid item xs={12/7}>
                <Item>{currentOverall}</Item>
              </Grid>
              <Grid item xs={12/7}>
                <Item>{currentPace}</Item>
              </Grid>
              <Grid item xs={12/7}>
                <Item>{currentShooting}</Item>
              </Grid>
              <Grid item xs={12/7}>
                <Item>{currentPassing}</Item>
              </Grid>
              <Grid item xs={12/7}>
                <Item>{currentDribbling}</Item>
              </Grid>
              <Grid item xs={12/7}>
                <Item>{currentDefending}</Item>
              </Grid>
              <Grid item xs={12/7}>
                <Item>{currentPhysical}</Item>
              </Grid>
            </Grid>

          <div style={{paddingTop: 10, paddingBottom: 10}}>
            <Autocomplete
              disablePortal
              options={playerList}
              sx={{width: (width / 2), maxHeight:height*0.4, textAlign: 'center'}}
              getOptionLabel={(option) => option.label}
              onChange={(event: any, newValue: Player | null) => autocompleteChange(newValue)}
              renderOption={(props, option) => (
                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                  <Grid container style={{paddingTop: 10}}>
                    <Grid item xs={3}>
                      <Item><b>{option.label}</b></Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item><b>{option.overall}</b></Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item>PAC:{option.pace}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item>SHO:{option.shooting}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item>PAS:{option.passing}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item>DRI:{option.dribbling}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item>DEF:{option.defending}</Item>
                    </Grid>
                    <Grid item xs={9/7}>
                      <Item>PHY:{option.physical}</Item>
                    </Grid>
                  </Grid>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: 'new-password', // disable autocomplete and autofill
                  }}
                />
              )}
            />
          </div>

          <Button variant="contained" className="button-guess" onClick={onGuess} disabled={currentPlayer === undefined || finished !== ''}>
            <b>Guess</b>
          </Button>
          
        </div>

      </section>

      <div style={{height: height * 0.1-1, width: width, textAlign: 'center'}}>
        <Button variant="contained" className='button-restart' onClick={() => setInstructionsOpen(true)}>
          <b>Instructions</b>
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Button variant="contained" className='button-restart' onClick={onLeaderboardClick}>
          <b>Leaderboard</b>
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Button variant="contained" className='button-restart' onClick={onRestart}>
          <b>Restart</b>
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Button variant="contained" className='button-restart' onClick={props?.signOut}>
          <b>Sign Out</b>
        </Button>
      </div>

      <Dialog open={instructionsOpen} onClose={() => setInstructionsOpen(false)}>
        <DialogTitle>Instructions</DialogTitle>
        <DialogContent>
          <DialogContentText> Type in the input box to choose from a list of FIFA players. </DialogContentText>
          <DialogContentText> Once you have selected your player, press the guess button. </DialogContentText>
          <DialogContentText> On the left hand side, it will show if the player stats are higher or lower. </DialogContentText>
          <DialogContentText> Green means higher. </DialogContentText>
          <DialogContentText> Red means lower. </DialogContentText>
          <DialogContentText> Yellow means correct. </DialogContentText>
          <DialogContentText> Try and guess the player in 5 attempts to win! </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInstructionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={winOpen}>
        <DialogTitle>You Win!</DialogTitle>
        <DialogContent>
          {guessedPlayers !== undefined 
            ? <DialogContentText> You took {guessedPlayers.findIndex((p: Player) => p.label === "Placeholder")} guesses! </DialogContentText>
            : null
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={onLeaderboardUpdate}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={loseOpen} onClose={() => setLoseOpen(false)}>
        <DialogTitle>You Lose!</DialogTitle>
        <DialogContent>
          {correctPlayer !== undefined
            ? <DialogContentText> The player was {correctPlayer.label}. </DialogContentText> 
            : null
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoseOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)}>
        <DialogTitle>Leaderboard</DialogTitle>
        <DialogContent>
          <DialogContentText><b>Top 5</b></DialogContentText>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={0.5} style={{paddingTop: 10}}>
              <Grid item xs={9}>
                <ItemBlue>Username</ItemBlue>
              </Grid>
              <Grid item xs={3}>
                <ItemBlue>Score</ItemBlue>
              </Grid> 
              {leaderboard}
            </Grid>
          </Box>
        {currentUser.username !== ""
          ? <>
              <DialogContentText>--</DialogContentText>
              <DialogContentText><b>Your Score</b></DialogContentText>
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={9}>
                    <Item style={{backgroundColor: 'yellow'}}>{currentUser.username}</Item>
                  </Grid>
                  <Grid item xs={3}>
                    <Item style={{backgroundColor: 'yellow'}}>{currentUser.score}</Item>
                  </Grid> 
                </Grid>
              </Box>
            </>
          : null
        }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaderboardOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}

export default withAuthenticator(App);