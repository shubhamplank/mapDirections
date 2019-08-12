

import React, { Component } from "react";
import { TextInput, StyleSheet, View, Dimensions } from "react-native";
import MapView from 'react-native-maps';
import Polyline from '@mapbox/polyline';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      concat: null,
      coords: [],
      x: 'false',
      cordLatitude: 28.5048,
      cordLongitude: 77.0970,
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
      let destinationLocation = this.state.cordLatitude + "," + this.state.cordLongitude
      this.setState({
        concat: currentLocation
      }, () => {
        this.getDirections(currentLocation, destinationLocation);
      });
    }

  }

  async getDirections(startLoc, destinationLoc) {

    try {
      let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}`)
      let respJson = await resp.json();
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

    return (
      <View>
        <TextInput
          style={styles.input}
          onChangeText={ (text) => text !=='' ? this.setState({latitude: parseInt(text)}): this.setState({longitude: 0})}
          value={this.state.text}
          placeholder = 'Latitude'
        />
        <TextInput
          style={styles.input}
          onChangeText={(text) => text !=='' ? this.setState({longitude: parseInt(text)}): this.setState({longitude: 0})}
          value={this.state.text}
          placeholder = 'Longitude'
        />
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

            {!!this.state.cordLatitude && !!this.state.cordLongitude && <MapView.Marker
              coordinate={{ "latitude": this.state.cordLatitude, "longitude": this.state.cordLongitude }}
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
                { latitude: this.state.cordLatitude, longitude: this.state.cordLongitude },
              ]}
              strokeWidth={2}
              strokeColor="red" />
            }
          </MapView>
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
    height: 40,
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 3,
    padding: 3,
    textAlign: 'center'
  }
});


export default App;

