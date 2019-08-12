

import React, { Component } from "react";
import { Text, TextInput, StyleSheet, View, Dimensions } from "react-native";
import MapView from 'react-native-maps';
import Polyline from '@mapbox/polyline';
import { LatRegex, LongRegex, key } from './constants';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: 28.2,
      longitude: 77.2,
      error: null,
      concat: null,
      coords: [],
      x: 'false',
      destinatinoLat: 27.1,
      destinatinoLong: 77.1,
    };
    
    this.mergeLot = this.mergeLot.bind(this);
  }

  componentDidMount() {
    console.log('didmMount-------------', this.state)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
        this.mergeLot();
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 },
    );
   
  }

  mergeLot() {
    console.log('MergeLot-------------', this.state)
    if (this.state.latitude != null && this.state.longitude != null) {
      let currentLocation = this.state.latitude + "," + this.state.longitude;
      let destinationLocation = this.state.destinatinoLat + "," + this.state.destinatinoLong
      this.setState({
        concat: currentLocation
      }, () => {
        this.getDirections(currentLocation, destinationLocation);
      });
    }
    

  }

  async getDirections(startLoc, destinationLoc) {

    try {
      console.log('Getdirection-------------', this.state)
      let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${key}`)
      let respJson = await resp.json();
      console.log('-------------------------inside get direction-----------------------');
      console.log(respJson);
      let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1]
        }
      })
      this.setState({ coords: coords })
      this.setState({ x: "true" })
      return coords
    } catch (error) {
      console.log(error)
      this.setState({ x: "error" })
      return error
    }
  }

  render() {
    console.log('Render-------------', this.state)
    return (
      <View>
        <View>
          <MapView style={styles.map} initialRegion={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 1,
            longitudeDelta: 1
          }}>

            {!!this.state.latitude && !!this.state.longitude && <MapView.Marker
              coordinate={{ "latitude": this.state.latitude, "longitude": this.state.longitude }}
              title={"Location"}
            />}

            {!!this.state.destinatinoLat && !!this.state.destinatinoLong && <MapView.Marker
              coordinate={{ "latitude": this.state.destinatinoLat, "longitude": this.state.destinatinoLong }}
              title={"Destination"}
            />}

            {!!this.state.latitude && !!this.state.longitude && this.state.x == 'true' && <MapView.Polyline
              coordinates={this.state.coords}
              strokeWidth={2}
              strokeColor="green" />
            }

            {!!this.state.latitude && !!this.state.longitude && this.state.x == 'error' && <MapView.Polyline
              coordinates={[
                { latitude: this.state.latitude, longitude: this.state.longitude },
                { latitude: this.state.destinatinoLat, longitude: this.state.destinatinoLong },
              ]}
              strokeWidth={2}
              strokeColor="blue" />
            }
          </MapView>
        </View>
        <View style={styles.box}>
          <TextInput
            keyboardType={'numeric'}
            style={styles.input}
            onChangeText={(text) => LatRegex.test(text) ? this.setState({ destinatinoLat: parseInt(text) }) : this.setState({ destinatinoLat: 0 })}
            value={this.state.text}
            placeholder='Latitude'
          />
          <TextInput
            keyboardType={'numeric'}
            style={styles.input}
            onChangeText={(text) => LongRegex.test(text) ? this.setState({ destinatinoLong: parseInt(text) }) : this.setState({ destinatinoLong: 0 })}
            value={this.state.text}
            placeholder='Longitude'
          />
        </View>
      </View>

    );
  }
}


const styles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  input: {
    width: 140,
    height: 40,
    margin: 2,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#00bfff',
    marginTop: 40,
    padding: 3,
    textAlign: 'center'
  },
  box: {
    height: 40,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  }
});


export default App;

