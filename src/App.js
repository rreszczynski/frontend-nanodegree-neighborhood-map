import React from 'react'
import './index.css'
import PlacesList from './PlacesList.js'

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			map: null,
			mapLoaded: false,
			places: [
				{
					name: "Święty Michał Pub",
					coords: {lat: 51.248768142420886, lng: 22.56881689673841},
					//each place will also have a google map marker object
				},
				{
					name: "Między Słowami Coffee",
					coords: {lat: 51.248665189164264, lng: 22.56762936677243},
				},
				{
					name: "Mandragora Restaurant",
					coords: {lat: 51.247903248762206, lng: 22.56829095095205},
				},
				{
					name: "Cafe Trybunalska",
					coords: {lat: 51.247955766696606, lng: 22.56766090992587},
				},
				{
					name: "Bosko Ice Cream Shop",
					coords: {lat: 51.24752445123503, lng: 22.56532203025106},
				}
			],			
			chosenMarker: null, //stores marker with opened infowindow
		}
		
	this.showInfoWin = this.showInfoWin.bind(this)
	}
	
	componentDidMount() {
		window.initMap = this.mapSetup
		//please insert working google maps api key below
		loadJS('https://maps.googleapis.com/maps/api/js?key=GOOGLE_MAP_API_KEY_GOES_HERE&libraries=places&callback=initMap')
	}

	//show Info window after clicking marker
	showInfoWin(marker) {
		this.state.chosenMarker && this.state.chosenMarker.setAnimation(null)
		var place = this.state.places.filter(place => {return place.marker === marker})[0]
		this.setState({ chosenMarker : marker })
		marker.setAnimation(window.google.maps.Animation.BOUNCE)
		this.populateInfoWindow(place)
		this.state.infoWin.open(this.state.map, marker)
	}

	//hides Info window
	hideInfoWin = () => {
		this.state.infoWin.close()
		this.state.chosenMarker && this.state.chosenMarker.setAnimation(null)
		this.setState({ chosenMarker : null })
	}
	
	//set content of the info window for chosen marker
	populateInfoWindow(place) {
		//basic info from places array
		var content = "<div id='loc-name'><strong>Name: </strong>" + place.name + "</div>"
		var errorMsg = "<div id='foursquare-error'>Couldn't load data from Foursquare...</div>"
		
		//getting data from Foursquare
		//please insert correct Foursquare clientId and ClientSecret
		var self = this
		var clientId = "FOURSQUARE_CLIENT_ID"
		var clientSecret = "FOURSQUARE_CLIENT_SECRET"
		var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret +
			"&v=20180803&ll=" + place.marker.getPosition().lat() + "," + place.marker.getPosition().lng() + "&limit=1"
		
		fetch(url).then(
			function (response) {
				if (response.status !== 200) {
					content += errorMsg
					console.log(content)
					self.state.infoWin.setContent(content)
					return
				}

				//retrieving data from response
				response.json().then(function (data) {
					var placeData = data.response.venues[0]
					var placeAddress = "<div><strong>Address: </strong>" + placeData.location.address + "</div>"
					content += placeAddress
					var fourSquareLink = '<a href="https://foursquare.com/v/'+ placeData.id +'" target="_blank">Go to Foursquare for more info!</a>'
					content += fourSquareLink
					self.state.infoWin.setContent(content)
				})
			}			
		).catch(function (err) {
				console.log(err)
				content += errorMsg
				self.state.infoWin.setContent(content)
			})			
	}	

	//initialize google map
	mapSetup = () => {
		var self = this
		//adding google map
		let map = new window.google.maps.Map(document.getElementById('map'), {
			center: {lat: 51.247990, lng: 22.567113},
			zoom: 18,
			mapTypeId: 'roadmap',
			disableDefaultUI: true
		})
		this.setState({ map })
		//adding markers to map
		this.addMarkers(map, self)		
		
		//checcking if the map is loaded correctly
		window.google.maps.event.addListener(map, 'tilesloaded', function() {
			self.setState({ mapLoaded : true })
			//clear the listener, we only need it once
			window.google.maps.event.clearListeners(map, 'tilesloaded')
			
		})
	}
	
	//add markers to map and to places array in state
	addMarkers(map, obj) {
		//adding info window
		var infoWin = new window.google.maps.InfoWindow()
		obj.setState( { infoWin })
		
		//closing the infowindow event
		window.google.maps.event.addListener(infoWin, 'closeclick', () => obj.hideInfoWin())
		
		//adding bounds - to stretch the map to show all markers
		var mapBounds = new window.google.maps.LatLngBounds()
		
		var currPlaces = obj.state.places		
			for (var i = 0; i < obj.state.places.length; i++) {
				var marker = new window.google.maps.Marker({
					position: obj.state.places[i].coords,
					name: obj.state.places[i].name,
				})		
				marker.setMap(map)
				mapBounds.extend(marker.position)

				currPlaces[i].marker = marker

				window.google.maps.event.addListener(marker, 'click', (function(marker) {
					return function() {
						obj.hideInfoWin()
						obj.showInfoWin(marker)
					}
				})(marker))
			}
		map.fitBounds(mapBounds)
		obj.setState({ places : currPlaces })
	}

	render() {
		return (
			<div id='app'>
				{
					this.state.mapLoaded &&
					<PlacesList
						id='locations-list'
						places={this.state.places}
						showInfoWin={this.showInfoWin}
						hideInfoWin={this.hideInfoWin}
					/>
				}
				{
					!this.state.mapLoaded &&
						<div>
							<h2>Loading Goolge Maps...</h2>
							<div>Try to refresh the page if this message is on the screen for too long.</div>
						</div>
				}
				<div id='map' role='application' aria-label='google map' tabIndex='-1'></div>
			</div>
		)
	}
}

export default App


//function for asynchronous load of google maps script
function loadJS(src) {
	var ref = window.document.getElementsByTagName("script")[0]
	var script = window.document.createElement("script")
	script.src = src
	script.async = true
	ref.parentNode.insertBefore(script, ref)
}
