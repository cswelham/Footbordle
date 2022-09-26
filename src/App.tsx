import { Autocomplete, Box, Button, createFilterOptions, Grid, Paper, styled, TextField } from '@mui/material';
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
import image from '../src/photos/soccer.png';

// Interface for a player
interface Player {
  id: number,
  label: string,
  overall: number,
  pace: number,
  shooting: number,
  passing: number,
  dribbling: number,
  defending: number,
  physical: number,
  image?: string
}

interface GuessHighLow {
  overall: number,
  pace: number,
  shooting: number,
  passing: number,
  dribbling: number,
  defending: number,
  physical: number,
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
  // Holds list of all possible players by overall
  const [possibleList, setPossibleList] = useState<Player[]>([]);
  // Holds list of all users
  const [userList, setUserList] = useState<User[]>([]);

  // List of all footballers
  const playerListManual: Player[] = [
    { id: 1, label: 'Lionel Messi', overall: 93, pace: 85, shooting: 92, passing: 91, dribbling: 95, defending: 34, physical: 60 },
    { id: 2, label: 'Robert Lewandowski', overall: 92, pace: 78, shooting: 92, passing: 79, dribbling: 86, defending: 44, physical: 82 },
    { id: 3, label: 'Cristiano Ronaldo', overall: 91, pace: 87, shooting: 94, passing: 80, dribbling: 88, defending: 34, physical: 75 },
    { id: 4, label: 'Neymar Jr', overall: 91, pace: 91, shooting: 83, passing: 86, dribbling: 94, defending: 37, physical: 63 },
    { id: 5, label: 'Kevin De Bruyne', overall: 91, pace: 76, shooting: 86, passing: 93, dribbling: 88, defending: 64, physical: 78 },
    { id: 6, label: 'Kylian Mbappe', overall: 91, pace: 97, shooting: 88, passing: 80, dribbling: 92, defending: 36, physical: 77 },
    { id: 7, label: 'Harry Kane', overall: 90, pace: 70, shooting: 91, passing: 83, dribbling: 83, defending: 47, physical: 83 },
    { id: 8, label: 'Ngolo Kante', overall: 89, pace: 78, shooting: 66, passing: 75, dribbling: 82, defending: 87, physical: 83 },
    { id: 9, label: 'Karim Benzema', overall: 89, pace: 76, shooting: 86, passing: 81, dribbling: 87, defending: 39, physical: 77 },
    { id: 10, label: 'Heung Min Son', overall: 89, pace: 88, shooting: 87, passing: 82, dribbling: 86, defending: 43, physical: 69 },
  ];

  // Holds player to guess
  const [correctPlayer, setCorrectPlayer] = useState<Player>(playerListManual[Math.floor(Math.random() * playerList.length)]);
  // Holds if user has finished
  const [finished, setFinished] = useState<string>('');

  // Holds guessed players
  const [guessedPlayers, setGuessedPlayers] = useState<Player[]>([
    { id: 1, label: 'Placeholder', overall: 99, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
    { id: 2, label: 'Placeholder', overall: 99, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
    { id: 3, label: 'Placeholder', overall: 99, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
    { id: 4, label: 'Placeholder', overall: 99, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
    { id: 5, label: 'Placeholder', overall: 99, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
    { id: 6, label: 'Placeholder', overall: 99, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
  ]);
  // Holds guessed stats
  const [guessedStats, setGuessedStats] = useState<GuessHighLow[]>([
    {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
    {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
    {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
    {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
    {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
    {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
  ]);

  // Variables to store current selected stats
  const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>(undefined);
  const [currentOverall, setCurrentOverall] = useState<string>('');
  const [currentPace, setCurrentPace] = useState<string>('');
  const [currentShooting, setCurrentShooting] = useState<string>('');
  const [currentPassing, setCurrentPassing] = useState<string>('');
  const [currentDribbling, setCurrentDribbling] = useState<string>('');
  const [currentDefending, setCurrentDefending] = useState<string>('');
  const [currentPhysical, setCurrentPhysical] = useState<string>('');

  // Holds dialog property for instructions
  const [instructionsOpen, setInstructionsOpen] = useState<boolean>(false);
  // Holds dialog property for win
  const [winOpen, setWinOpen] = useState<boolean>(false);
  // Holds dialog property for lose
  const [loseOpen, setLoseOpen] = useState<boolean>(false);
  // Holds dialog property for leaderboard
  const [leaderboardOpen, setLeaderboardOpen] = useState<boolean>(false);
  // Holds dialog property for subscribe
  const [subscribeOpen, setSubscribeOpen] = useState<boolean>(false);
  // Holds current user if they are in the database
  const [currentUser, setCurrentUser] = useState<User>({ id: "", username: "", score: 0 });
  // Holds current email
  const [currentEmail, setCurrentEmail] = useState<string>("");

  // Holds if autocomplete is loading
  const [acLoading, setAcLoading] = useState<boolean>(true);
  // Holds autocomplete value
  const [acValue, setAcValue] = useState<Player | null>(null);
  // Limit the autocomplete options
  const acFilterOptions = createFilterOptions({
    limit: 30,
    stringify: (option: Player) => option.label,
  });
  // Holds if the user can guess
  const [canGuess, setCanGuess] = useState<boolean>(true);


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

  // Retreives json from api
  async function playerApiCall() {
    try {
      // Get session token
      var token: any = await Auth.currentSession().then(session => session).catch(err => console.log(err));
      // Call api
      const query = await fetch('https://qo0jt72i36.execute-api.us-east-1.amazonaws.com/players', {
        method: 'GET',
        headers: {
          Authorization: token.idToken.jwtToken,
        },
      });
      const json = await query.json();
      if (apiArray === undefined) {
        setApiArray(json);
        // Set autocomplete loading to false
        setAcLoading(false);
      }
      // Retrieve the user's username and email
      Auth.currentAuthenticatedUser().then((user) => {
        const currentUsername: string = user.username.charAt(0).toUpperCase() + user.username.slice(1);

        // Find if the user is in the database
        const index: number = userList.findIndex((user: User) => user.username === currentUsername);
        if (index > -1) {
          setCurrentUser({ id: currentUser.username, username: currentUsername, score: userList[index].score });
        }
        else {
          setCurrentUser({ id: currentUser.username, username: currentUsername, score: 0 });
        }
        setCurrentEmail(user.email);
      });
    }
    catch (e) {
      console.log(e);
    }
  }

  // Renders the fetch users on first render
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Setup the players array by calling the api
  useEffect(() => {
    // Update user list
    var newUserList: User[] = [...userList];
    newUserList = orderUserArray(newUserList);
    setUserList(newUserList);
    try {
      playerApiCall();
      // Create the list of players from api array
      var newPlayerList: Player[] = []
      if (apiArray !== undefined) {
        var newApiArray: Player[] = apiArray.filter((x: any) => x.positions !== 'GK');
        newApiArray = newApiArray.filter((x: any) => x.overall > 82);
        newPlayerList = newApiArray.map((p: any) => {
          return (
            {
              id: p.id, label: p.name, overall: p.overall, pace: p.pace, shooting: p.shooting, passing: p.passing,
              dribbling: p.dribbling, defending: p.defending, physical: p.physical, image: p.faceurl
            }
          )
        });
        // Set player list
        setPlayerList(newPlayerList);
        setPossibleList(newPlayerList);
      };
    }
    // Api not working
    catch (e) {
      // Set player list
      setPlayerList(playerListManual);
      // Set the correct player
      setCorrectPlayer((playerListManual[Math.floor(Math.random() * playerList.length)]));
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
      newDatabase = orderUserArray(newDatabase);
      setUserList(newDatabase);

      // Find if the user is in the database
      const index: number = userList.findIndex((user: User) => user.username === currentUser.username);
      if (index > -1) {
        setCurrentUser({ id: userList[index].id, username: currentUser.username, score: userList[index].score });
      }
    }
    catch (e) {
      // Data storage doesn't work so use manual list
      setUserList([
        { id: "1", username: "Robert", score: 5 },
        { id: "2", username: "James", score: 7 },
        { id: "3", username: "Kerry", score: 12 },
        { id: "4", username: "Lauren", score: 2 },
        { id: "5", username: "Bruce", score: 4 },
        { id: "6", username: "Kyle", score: 11 },
        { id: "7", username: "Jake", score: 9 },
      ]);
    }
  }

  // Create a new user
  async function createUser() {
    await API.graphql({ query: createUserMutation, variables: { input: { username: currentUser.username, score: 1 } } });
    const newUserList: User[] = [...userList, { username: currentUser.username, score: 1 }];
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
      await API.graphql({ query: updateUserMutation, variables: { input: { id: newUserList[current].id, username: currentUser.username, 
        score: (Number(newUserList[current].score) + 1) } } });
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
    setAcValue(value);
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
  async function onGuess() {
    // Set timeout for guessing 1.5 seconds
    setCanGuess(false);
    setTimeout(() => { setCanGuess(true) }, 1500);

    // Add to guessed players
    var newGuessedPlayers: Player[] = [...guessedPlayers];
    const index: number = newGuessedPlayers.findIndex((p: Player) => p.label === "Placeholder");
    newGuessedPlayers[index] = currentPlayer!;
    setGuessedPlayers(newGuessedPlayers);

    // Get session token
    var token: any = await Auth.currentSession().then(session => session).catch(err => console.log(err));
    // Call guess api
    const query = await fetch(`https://qo0jt72i36.execute-api.us-east-1.amazonaws.com/guess?playerID=${currentPlayer!.id}`, {
      method: 'POST',
      headers: {
        Authorization: token.idToken.jwtToken,
      },
    });
    const json = await query.json();
    var newGuessedStats: GuessHighLow[] = [...guessedStats];
    newGuessedStats[index] =  {overall: json.overall, pace: json.pace, shooting: json.shooting, passing: json.passing, dribbling: json.dribbling, 
      defending: json.defending, physical: json.physical};
    setGuessedStats(newGuessedStats);

    // If the api returns a player
    if (json.id !== undefined) {
      // Set correct player
      setCorrectPlayer({ id: json.id, label: json.name, overall: json.overall, pace: json.pace, shooting: json.shooting, passing: json.passing, dribbling: json.dribbling, 
        defending: json.defending, physical: json.physical, image: json.faceurl});
      // If guessed player is correct
      if (json.id === currentPlayer!.id) {
        setFinished('W');
        setTimeout(() => setWinOpen(true), 500);
      }
      else {
        setFinished('L');
        setTimeout(() => setLoseOpen(true), 500);
      }
    }
    else {
      var low: number = 0;
      var high: number = 99;
      var correct: boolean = false;
      var statsFiltered = newGuessedStats.filter((g: GuessHighLow) => g.overall !== -2);
      console.log(statsFiltered);
      for (let i = 0; i < statsFiltered.length; i++) {
        var overall: number = newGuessedPlayers[i].overall;
        // If overall guessed correctly
        if (statsFiltered[i].overall === 0) {
          correct = true;
          low = overall
          break;
        }
        // Get lowest overall range
        else if (statsFiltered[i].overall === 1) {
          if (overall > low)
            low = overall;
        }
        // Get highest overall range
        else {
          if (overall < high)
            high = overall;
        }
      }
      // Filter the possible players by the range
      var newPossibleList: Player[] = [...possibleList];
      if (!correct)
        newPossibleList = newPossibleList.filter((p: Player) => p.overall > low && p.overall < high);
      else
        newPossibleList = newPossibleList.filter((p: Player) => p.overall === low);
      setPossibleList(newPossibleList);
    }
  }

  // User clicks restart
  async function onRestart() {
    setAcValue(null);
    // Reset variables
    setFinished('');
    setGuessedPlayers([
      { id: 1, label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
      { id: 2, label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
      { id: 3, label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
      { id: 4, label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
      { id: 5, label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
      { id: 6, label: 'Placeholder', overall: 0, pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
    ]);
    setGuessedStats([
      {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
      {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
      {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
      {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
      {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
      {overall: -2, pace: -2, shooting: -2, passing: -2, dribbling: -2, defending: -2, physical: -2},
    ]);
    setCurrentPlayer(undefined);
    setCurrentOverall('');
    setCurrentPace('');
    setCurrentShooting('');
    setCurrentPassing('');
    setCurrentDribbling('');
    setCurrentDefending('');
    setCurrentPhysical('');
    setPossibleList([...playerList]);

    // Get session token
    var token: any = await Auth.currentSession().then(session => session).catch(err => console.log(err));
    // Call newgame api
    await fetch('https://qo0jt72i36.execute-api.us-east-1.amazonaws.com/newgame', {
      method: 'POST',
      headers: {
        Authorization: token.idToken.jwtToken,
      },
    });
  }

  // Determines colour of grid item
  function gridItemColour(value: number) {
    if (value === 1) {
      return 'lightgreen';
    }
    else if (value === -1) {
      return "#ffcccb";
    }
    else {
      return "yellow";
    }
  }

  // Determines colour of grid item for last guess
  function gridItemColourLast(value1: number, value2: number) {
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

  // User subscribes to notifications
  async function onSubscribe() {
    // Get session token
    var token: any = await Auth.currentSession().then(session => session).catch(err => console.log(err));
    // Call api
    await fetch('https://qo0jt72i36.execute-api.us-east-1.amazonaws.com/subscribe', {
      method: 'POST',
      body: currentEmail,
      headers: {
        Authorization: token.idToken.jwtToken,
      },
    });
    // Close dialog
    setSubscribeOpen(false);
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

  // Returns number of guesses after winning
  function numberGuesses() {
    if (guessedPlayers.findIndex((p: Player) => p.label === "Placeholder") === -1) {
      return 6;
    }
    else {
      return guessedPlayers.findIndex((p: Player) => p.label === "Placeholder");
    }
  }

  // Renders the leaderboard scores
  const leaderboard = useMemo(() => userList.map(
    (user: User, index: number) => {
      if (index < 5) {
        if (user.username === currentUser.username) {
          return (
            <>
              <Grid item xs={9}>
                <Item style={{ backgroundColor: 'yellow' }}>{user.username}</Item>
              </Grid>
              <Grid item xs={3}>
                <Item style={{ backgroundColor: 'yellow' }}>{user.score}</Item>
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
    (guess: Player, index: number) => {
      if (guess.label === "Placeholder" && guessedStats[index].overall === -2) {
        return (
          <Grid container spacing={0.5} style={{ paddingTop: 10 }}>
            <Grid item xs={3}> <Item></Item>  </Grid>
            <Grid item xs={9 / 7}> <Item></Item> </Grid>
            <Grid item xs={9 / 7}> <Item></Item> </Grid>
            <Grid item xs={9 / 7}> <Item></Item> </Grid>
            <Grid item xs={9 / 7}> <Item></Item> </Grid>
            <Grid item xs={9 / 7}> <Item></Item> </Grid>
            <Grid item xs={9 / 7}> <Item></Item> </Grid>
            <Grid item xs={9 / 7}> <Item></Item> </Grid>
          </Grid>
        )
      }
      else if (index === 5) {
        return (
          <Grid container spacing={0.5} style={{ paddingTop: 10 }}>
            <Grid item xs={3}>
              <Item>{guess.label}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColourLast(currentPlayer!.overall, guessedStats[index].overall) }}>{guess.overall}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColourLast(currentPlayer!.pace, guessedStats[index].pace) }}>{guess.pace}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColourLast(currentPlayer!.shooting, guessedStats[index].shooting) }}>{guess.shooting}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColourLast(currentPlayer!.passing, guessedStats[index].passing) }}>{guess.passing}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColourLast(currentPlayer!.dribbling, guessedStats[index].dribbling) }}>{guessedPlayers[0].dribbling}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColourLast(currentPlayer!.defending, guessedStats[index].defending) }}>{guess.defending}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColourLast(currentPlayer!.physical, guessedStats[index].physical) }}>{guess.physical}</Item>
            </Grid>
          </Grid>
        )
      }
      else {
        return (
          <Grid container spacing={0.5} style={{ paddingTop: 10 }}>
            <Grid item xs={3}>
              <Item>{guess.label}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColour(guessedStats[index].overall) }}>{guess.overall}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColour(guessedStats[index].pace) }}>{guess.pace}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColour(guessedStats[index].shooting) }}>{guess.shooting}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColour(guessedStats[index].passing) }}>{guess.passing}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColour(guessedStats[index].dribbling) }}>{guessedPlayers[0].dribbling}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColour(guessedStats[index].defending) }}>{guess.defending}</Item>
            </Grid>
            <Grid item xs={9 / 7}>
              <Item style={{ backgroundColor: gridItemColour(guessedStats[index].physical) }}>{guess.physical}</Item>
            </Grid>
          </Grid>
        )
      }
    }
    // eslint-disable-next-line
  ), [guessedStats]);

  return (
    <div className='myDiv' style={{ height: height - 1, width: width, overflow: 'hidden' }}>
      <header className="App-header" style={{ height: height * 0.25, width: width }}>
        <h1>F<img src={image} alt="Football" style={{ height: 50 }}></img><img src={image} alt="Football" style={{ height: 50 }}></img>tbordle</h1>
        <p>Wordle but for FIFA 22 players! Try to guess the FIFA footballer in 6 guesses to win!</p>
      </header>

      <section className="container" style={{ height: height * 0.65, width: width }}>

        <div className="one" style={{ height: height * 0.65, width: width / 2 - 20, textAlign: 'center' }}>
          <h2>Past Guesses</h2>
          <Box sx={{ flexGrow: 1 }}>
            <Grid className='item-name' container spacing={0.5}>
              <Grid item xs={3}>
                <Item><b>Name</b></Item>
              </Grid>
              <Grid item xs={9 / 7}>
                <Item><b>Overall</b></Item>
              </Grid>
              <Grid item xs={9 / 7}>
                <Item><b>Pace</b></Item>
              </Grid>
              <Grid item xs={9 / 7}>
                <Item><b>Shooting</b></Item>
              </Grid>
              <Grid item xs={9 / 7}>
                <Item><b>Passing</b></Item>
              </Grid>
              <Grid item xs={9 / 7}>
                <Item><b>Dribbling</b></Item>
              </Grid>
              <Grid item xs={9 / 7}>
                <Item><b>Defending</b></Item>
              </Grid>
              <Grid item xs={9 / 7}>
                <Item><b>Physical</b></Item>
              </Grid>
            </Grid>
            {guesses}
          </Box>
        </div>

        <div className="two" style={{ height: height * 0.55, width: width / 2, textAlign: 'center' }}>
          <h2 className='h2-pad'>Current Guess</h2>

          <Grid className='item-name' container spacing={0.5}>
            <Grid item xs={12 / 7}>
              <Item><b>Overall</b></Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item><b>Pace</b></Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item><b>Shooting</b></Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item><b>Passing</b></Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item><b>Dribbling</b></Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item><b>Defending</b></Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item><b>Physical</b></Item>
            </Grid>
          </Grid>

          <Grid container spacing={0.5} style={{ paddingTop: 10 }}>
            <Grid item xs={12 / 7}>
              <Item>{currentOverall}</Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item>{currentPace}</Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item>{currentShooting}</Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item>{currentPassing}</Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item>{currentDribbling}</Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item>{currentDefending}</Item>
            </Grid>
            <Grid item xs={12 / 7}>
              <Item>{currentPhysical}</Item>
            </Grid>
          </Grid>

          <div style={{ paddingTop: 10, paddingBottom: 10 }}>
            <Autocomplete
              disablePortal
              options={possibleList}
              loading={acLoading}
              value={acValue}
              filterOptions={acFilterOptions}
              sx={{ width: (width / 2), maxHeight: height * 0.4, textAlign: 'center', backgroundColor:'white' }}
              getOptionLabel={(option: Player) => option.label}
              onChange={(event: any, newValue: Player | null) => autocompleteChange(newValue)}
              renderOption={(props, option: Player) => (
                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                  <Grid container style={{ paddingTop: 10 }}>
                    <Grid item xs={3}>
                      <Item><b>{option.label}</b></Item>
                    </Grid>
                    <Grid item xs={9 / 7}>
                      <Item><b>{option.overall}</b></Item>
                    </Grid>
                    <Grid item xs={9 / 7}>
                      <Item>PAC:{option.pace}</Item>
                    </Grid>
                    <Grid item xs={9 / 7}>
                      <Item>SHO:{option.shooting}</Item>
                    </Grid>
                    <Grid item xs={9 / 7}>
                      <Item>PAS:{option.passing}</Item>
                    </Grid>
                    <Grid item xs={9 / 7}>
                      <Item>DRI:{option.dribbling}</Item>
                    </Grid>
                    <Grid item xs={9 / 7}>
                      <Item>DEF:{option.defending}</Item>
                    </Grid>
                    <Grid item xs={9 / 7}>
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

          <div className='button1'>
            <Button variant="contained" className="btn-hover button-guess" onClick={onGuess} disabled={currentPlayer === undefined || finished !== '' || !canGuess}>
              <b>Guess</b>
            </Button>
          </div>

          {finished === "L"
            ? <>
              <h2 style={{marginBottom: '0'}}>Correct Player</h2>
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={0.5} style={{ paddingTop: 23 }}>
                  <Grid item xs={3}>
                    <Item style={{ backgroundColor: "yellow" }}>{correctPlayer.label}</Item>
                  </Grid>
                  <Grid item xs={9 / 7}>
                    <Item style={{ backgroundColor: "yellow" }}>{correctPlayer.overall}</Item>
                  </Grid>
                  <Grid item xs={9 / 7}>
                    <Item style={{ backgroundColor: "yellow" }}>{correctPlayer.pace}</Item>
                  </Grid>
                  <Grid item xs={9 / 7}>
                    <Item style={{ backgroundColor: "yellow" }}>{correctPlayer.shooting}</Item>
                  </Grid>
                  <Grid item xs={9 / 7}>
                    <Item style={{ backgroundColor: "yellow" }}>{correctPlayer.passing}</Item>
                  </Grid>
                  <Grid item xs={9 / 7}>
                    <Item style={{ backgroundColor: "yellow" }}>{correctPlayer.dribbling}</Item>
                  </Grid>
                  <Grid item xs={9 / 7}>
                    <Item style={{ backgroundColor: "yellow" }}>{correctPlayer.defending}</Item>
                  </Grid>
                  <Grid item xs={9 / 7}>
                    <Item style={{ backgroundColor: "yellow" }}>{correctPlayer.physical}</Item>
                  </Grid>
                </Grid>
              </Box>
            </>
            : null
          }

        </div>

      </section>

      <div className='button2' style={{ height: height * 0.2 - 1, width: width, textAlign: 'center' }}>
        <Button variant="contained" className='btn-hover button-restart' onClick={() => setInstructionsOpen(true)}>
          <b>Instructions</b>
        </Button>
        <Button variant="contained" className='btn-hover button-restart' onClick={onLeaderboardClick}>
          <b>Leaderboard</b>
        </Button>
        <Button variant="contained" className='btn-hover button-restart' onClick={onRestart}>
          <b>Restart</b>
        </Button>
        <Button variant="contained" className='btn-hover button-restart' onClick={() => setSubscribeOpen(true)}>
          <b>Subscribe</b>
        </Button>
        <Button variant="contained" className='btn-hover button-restart' onClick={props?.signOut}>
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
          <DialogContentText> Try and guess the player in 6 attempts to win! </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInstructionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={subscribeOpen} onClose={() => setSubscribeOpen(false)}>
        <DialogTitle>Subscribe to Email Notifications</DialogTitle>
        <DialogContent>
          <DialogContentText> Do you want to receieve email notifications from Footbordle? </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onSubscribe}>Yes</Button>
          <Button onClick={() => setSubscribeOpen(false)}>No</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={winOpen}>
        <DialogTitle>You Win!</DialogTitle>
        <DialogContent>
          {guessedPlayers !== undefined && correctPlayer !== undefined
            ? <>
              <DialogContentText> You took {numberGuesses().toString()} guesses! </DialogContentText>
              <DialogContentText> The player was:</DialogContentText>
              <DialogContentText>{correctPlayer.label}</DialogContentText>
              {correctPlayer.image !== undefined
                ? <img src={correctPlayer.image} alt="Correct football player"/>
                : null
              }
            </>
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
            ? <>
              <DialogContentText> The player was:</DialogContentText>
              <DialogContentText>{correctPlayer.label}</DialogContentText>
              {correctPlayer.image !== undefined
                ? <img src={correctPlayer.image} alt="Correct football player"/>
                : null
              }
            </>
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
            <Grid className='item-name' container spacing={0.5} style={{ paddingTop: 10 }}>
              <Grid item xs={9}>
                <Item>Username</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>Score</Item>
              </Grid>
            </Grid>
            <Grid container spacing={0.5} style={{ paddingTop: 10 }}>
              {leaderboard}
            </Grid>
          </Box>
          {currentUser.username !== ""
            ? <>
              <DialogContentText>--</DialogContentText>
              <DialogContentText><b>Your Score</b></DialogContentText>
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={0.5} style={{ paddingTop: 10 }}>
                  <Grid item xs={9}>
                    <Item style={{ backgroundColor: 'yellow' }}>{currentUser.username}</Item>
                  </Grid>
                  <Grid item xs={3}>
                    <Item style={{ backgroundColor: 'yellow' }}>{currentUser.score}</Item>
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