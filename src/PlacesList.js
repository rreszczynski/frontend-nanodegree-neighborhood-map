import React from 'react'
import Place from './Place'
import PropTypes from 'prop-types'

class PlacesList extends React.Component {
	static propTypes = {
		places: PropTypes.array.isRequired,
		showInfoWin: PropTypes.func.isRequired,
		hideInfoWin: PropTypes.func.isRequired
	}
	
	state = {
		query: '',
		foundPlaces: []
	}
	
	componentWillMount() {
		this.setState({foundPlaces : this.props.places})
	}
	
	//search through places and display only matching ones
	searchResults(ev) {
		this.props.hideInfoWin()
		this.setState({ foundPlaces : this.props.places })
		this.state.foundPlaces.forEach(place => {
			place.marker.setVisible(false)
		})
		const query = ev.target.value.toLowerCase()
		var foundPlaces = this.props.places.filter(place => {return place.name.toLowerCase().includes(query)})
		foundPlaces.forEach(place => {
			place.marker.setVisible(true)
		})
		this.setState({ foundPlaces })
	}	
	
	render() {
    return (
			<div id='locations-list'>
				<input
					tabIndex='1'
					id='search'
					role='search'
					aria-label='search places'
					placeholder='Search'
					onChange={(ev) => this.searchResults(ev)}
				/>
				
				<ul tabIndex='2'>
					{this.state.foundPlaces.map((place, idx) => (
						<Place place={place} key={idx} showInfoWin={this.props.showInfoWin}/>
					))} 
				</ul>
			</div>
    )
  } 
}

export default PlacesList