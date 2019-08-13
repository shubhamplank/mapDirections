

import React, { Component } from "react";
import { Text, TextInput, StyleSheet, View, Dimensions, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from "react-native";
import MapView from 'react-native-maps';
import Polyline from '@mapbox/polyline';
import { LatRegex, LongRegex, key } from './constants';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      concat: null,
      coords: [],
      isPath: 'false',
      destinatinoLat: 28.7,
      destinatinoLong: 77.1,
    };
    this.mergeLot = this.mergeLot.bind(this);
  }

  componentDidMount() {
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
      let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${key}`)
      let respJson = await resp.json();
      let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1]
        }
      })
      this.setState({ coords: coords })
      this.setState({ isPath: "true" })

    } catch (error) {
      this.setState({ isPath: "error" })
      return error
    }
  }

  onPress() {
    Keyboard.dismiss();
    this.mergeLot();
  }

  render() {
    const { latitude, longitude, error, concat, coords, isPath, destinatinoLat, destinatinoLong } = this.state;
    return (
      <View>
        <View>
          <MapView style={styles.map} initialRegion={{
            latitude: destinatinoLat,
            longitude: destinatinoLong,
            latitudeDelta: 1,
            longitudeDelta: 1
          }}>

            {!!latitude && !!longitude && <MapView.Marker
              coordinate={{ "latitude": latitude, "longitude": longitude }}
              title={"Location"}
            />}

            {!!destinatinoLat && !!destinatinoLong && <MapView.Marker
              coordinate={{ "latitude": destinatinoLat, "longitude": destinatinoLong }}
              title={"Destination"}
            />}

            {!!latitude && !!longitude && isPath == 'true' && <MapView.Polyline
              coordinates={coords}
              strokeWidth={3}
              strokeColor="#6D81FC" />
            }

            {!!latitude && !!longitude && isPath == 'error' && <MapView.Polyline
              coordinates={[
                { latitude: latitude, longitude: longitude },
                { latitude: destinatinoLat, longitude: destinatinoLong },
              ]}
              strokeWidth={2}
              strokeColor="red" />
            }
          </MapView>
        </View>
        <View style={styles.box}>
          <View style={{ flexDirection: 'row' }}>
            <TextInput
              keyboardType={'numeric'}
              style={styles.input}
              onChangeText={(text) => LatRegex.test(text) ? this.setState({ destinatinoLat: parseInt(text) }) : true}
              value={this.state.text}
              placeholder='Latitude'
            />
            <TextInput
              keyboardType={'numeric'}
              style={styles.input}
              onChangeText={(text) => LongRegex.test(text) ? this.setState({ destinatinoLong: parseInt(text) }) : true}
              value={this.state.text}
              placeholder='Longitude'
            />
          </View>
          <View>
            <TouchableOpacity
              onPress={() => this.onPress()}
              style={styles.button}
            >
              <Text style={{ textAlign: 'center', marginTop: 4 }}> Go </Text>
            </TouchableOpacity>
          </View>
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
  box: {
    height: 40,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  input: {
    width: 140,
    height: 40,
    margin: 1,
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00bfff',
    marginTop: 40,
    padding: 3,
    textAlign: 'center'
  },
  button: {
    width: 60,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00bfff',
    marginTop: 40,
    padding: 3,
    textAlign: 'center'
  }
});
export default App;

