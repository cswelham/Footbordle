import { Autocomplete, Box, Button, Grid, Paper, styled, TextField } from '@mui/material';
import React, { useState } from 'react';
import './App.css';
import useWindowDimensions from './Tools/Window';
import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator } from "@aws-amplify/ui-react";

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

// Interface for AppProps
interface AppProps {
  signOut?: any,
}

function App(props?: AppProps) {

  // List of all footballers
  const playerList: Player[] = [
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
  const [guessedPlayers, setGuessedPlayers] = useState<Player[]>([]);

  // Variables to store current selected stats
  const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>(undefined);
  const [currentOverall, setCurrentOverall] = useState<string>('');
  const [currentPace, setCurrentPace] = useState<string>('');
  const [currentShooting, setCurrentShooting]  = useState<string>('');
  const [currentPassing, setCurrentPassing] = useState<string>('');
  const [currentDribbling, setCurrentDribbling]  = useState<string>('');
  const [currentDefending, setCurrentDefending]  = useState<string>('');
  const [currentPhysical, setCurrentPhysical]  = useState<string>('');

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
    const newPlayer: Player = currentPlayer!;
    setGuessedPlayers(guessedPlayers => [...guessedPlayers, newPlayer]);
    // Users selects correct player
    if (correctPlayer.label === currentPlayer!.label) {
      setFinished('W');
      setTimeout(() => { alert("You Win! You took " + (guessedPlayers.length + 1) + " guesses!") }, 500);
    }
    // User selects wrong
    else {
      // If out of guesses
      if (guessedPlayers.length === 4) {
        setFinished('L');
        setTimeout(() => { alert('You Lose! The player was ' + correctPlayer.label) }, 500);
      }
    }
  }

  // User clicks restart
  function onRestart() {
    // Pick new player
    setCorrectPlayer((playerList[Math.floor(Math.random()*playerList.length)]));
    // Reset variables
    setFinished('');
    setGuessedPlayers([]);
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
            {guessedPlayers[0] === undefined 
              ? <>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={3}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                </Grid>
              </>
              : <>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={3}>
                    <Item>{guessedPlayers[0].label}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[0].overall, correctPlayer.overall)}}>{guessedPlayers[0].overall}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[0].pace, correctPlayer.pace)}}>{guessedPlayers[0].pace}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[0].shooting, correctPlayer.shooting)}}>{guessedPlayers[0].shooting}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[0].passing, correctPlayer.passing)}}>{guessedPlayers[0].passing}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[0].dribbling, correctPlayer.dribbling)}}>{guessedPlayers[0].dribbling}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[0].defending, correctPlayer.defending)}}>{guessedPlayers[0].defending}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[0].physical, correctPlayer.physical)}}>{guessedPlayers[0].physical}</Item>
                  </Grid>
                </Grid>
              </>
            }
            {guessedPlayers[1] === undefined 
              ? <>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={3}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                </Grid>
              </>
              : <>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={3}>
                    <Item>{guessedPlayers[1].label}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[1].overall, correctPlayer.overall)}}>{guessedPlayers[1].overall}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[1].pace, correctPlayer.pace)}}>{guessedPlayers[1].pace}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[1].shooting, correctPlayer.shooting)}}>{guessedPlayers[1].shooting}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[1].passing, correctPlayer.passing)}}>{guessedPlayers[1].passing}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[1].dribbling, correctPlayer.dribbling)}}>{guessedPlayers[1].dribbling}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[1].defending, correctPlayer.defending)}}>{guessedPlayers[1].defending}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[1].physical, correctPlayer.physical)}}>{guessedPlayers[1].physical}</Item>
                  </Grid>
                </Grid>
              </>
            }
            {guessedPlayers[2] === undefined 
              ? <>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={3}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                </Grid>
              </>
              : <>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={3}>
                    <Item>{guessedPlayers[2].label}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[2].overall, correctPlayer.overall)}}>{guessedPlayers[2].overall}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[2].pace, correctPlayer.pace)}}>{guessedPlayers[2].pace}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[2].shooting, correctPlayer.shooting)}}>{guessedPlayers[2].shooting}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[2].passing, correctPlayer.passing)}}>{guessedPlayers[2].passing}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[2].dribbling, correctPlayer.dribbling)}}>{guessedPlayers[2].dribbling}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[2].defending, correctPlayer.defending)}}>{guessedPlayers[2].defending}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[2].physical, correctPlayer.physical)}}>{guessedPlayers[2].physical}</Item>
                  </Grid>
                </Grid>
              </>
            }
            {guessedPlayers[3] === undefined 
              ? <>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={3}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                </Grid>
              </>
              : <>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={3}>
                    <Item>{guessedPlayers[3].label}</Item>
                  </Grid> 
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[3].overall, correctPlayer.overall)}}>{guessedPlayers[3].overall}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[3].pace, correctPlayer.pace)}}>{guessedPlayers[3].pace}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[3].shooting, correctPlayer.shooting)}}>{guessedPlayers[3].shooting}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[3].passing, correctPlayer.passing)}}>{guessedPlayers[3].passing}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[3].dribbling, correctPlayer.dribbling)}}>{guessedPlayers[3].dribbling}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[3].defending, correctPlayer.defending)}}>{guessedPlayers[3].defending}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[3].physical, correctPlayer.physical)}}>{guessedPlayers[3].physical}</Item>
                  </Grid>
                </Grid>
              </>
            }
            {guessedPlayers[4] === undefined 
              ? <>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={3}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                </Grid>
              </>
              : <>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={3}>
                    <Item>{guessedPlayers[4].label}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[4].overall, correctPlayer.overall)}}>{guessedPlayers[4].overall}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[4].pace, correctPlayer.pace)}}>{guessedPlayers[4].pace}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[4].shooting, correctPlayer.shooting)}}>{guessedPlayers[4].shooting}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[4].passing, correctPlayer.passing)}}>{guessedPlayers[4].passing}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[4].dribbling, correctPlayer.dribbling)}}>{guessedPlayers[4].dribbling}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[4].defending, correctPlayer.defending)}}>{guessedPlayers[4].defending}</Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item style={{backgroundColor: gridItemColour(guessedPlayers[4].physical, correctPlayer.physical)}}>{guessedPlayers[4].physical}</Item>
                  </Grid>
                </Grid>
              </>
            }
          </Box>

          <h2>Correct Player</h2>
          <Box sx={{ flexGrow: 1 }}>
          {finished === "" 
              ? <>
                <Grid container spacing={0.5} style={{paddingTop: 10}}>
                  <Grid item xs={3}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                  <Grid item xs={9/7}>
                    <Item><b></b></Item>
                  </Grid>
                </Grid>
              </>
              : <>
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
              </>
            }
          </Box>
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
        <Button variant="contained" className='button-restart' onClick={() => 
            alert("Instructions.\n" +
            "Type in the input box to choose from a list of FIFA players.\nOnce you have selected your player, press the guess button.\n" + 
            "On the left hand side, it will show if the player stats are higher or lower.\nGreen means higher.\nRed means lower.\n" + 
            "Yellow means correct.\nTry and guess the player in 5 attempts to win!")}>
          <b>Instructions</b>
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
    </div>
  );
}

export default withAuthenticator(App);
