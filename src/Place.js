import React from 'react'
import PropTypes from 'prop-types'

class Place extends React.Component {
	static propTypes = {
		place: PropTypes.object.isRequired,
		showInfoWin: PropTypes.func.isRequired
	}
	
	render() {
		const place = this.props.place

		return(
			<li
				tabIndex='3'
				role='button'
				className='element'
				key={this.props.index}
				onClick={(ev) => this.props.showInfoWin(place.marker)}
				onKeyPress={(ev) => this.props.showInfoWin(place.marker)}
			>{this.props.place.name}</li>
		)
		}
}

export default Place