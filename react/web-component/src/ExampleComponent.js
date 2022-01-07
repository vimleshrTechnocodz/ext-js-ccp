import * as React from 'react'
import PropTypes from 'prop-types'

export class ExampleComponent extends React.Component {
	static propTypes = {
		onHelloEvt: PropTypes.func,
	}

	render() {
		const { name, onHelloEvt } = this.props
		return (
			<div className='exampleComponent'>
				<h1>React's Custom List</h1>
				<p>2. Drink Soda</p>
			</div>
		)
	}
}
