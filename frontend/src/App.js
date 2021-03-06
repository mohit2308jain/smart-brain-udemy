import React from 'react';
import './App.css';

import Navigation from './components/Navigation';
import Logo from './components/Logo';
import ImageLinkForm from './components/ImageLinkForm';
import Rank from './components/Rank';
import FaceRecognition from './components/FaceRecognition';
import Signin from './components/Signin';
import Register from './components/Register';

import Particles from 'react-particles-js';

 const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: '',
      joined: ''
    }
}

class App extends React.Component {
  state = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: '',
      joined: ''
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }
  
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onSubmit = () => {
    this.setState({imageUrl: this.state.input});
      fetch('https://hidden-gorge-84424.herokuapp.com/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then((response) => response.json())
      .then((response) => {
        if(response){
          fetch('https://hidden-gorge-84424.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then((response) => response.json())
          .then((count) => {
            this.setState(Object.assign(this.state.user, { entries: count }))
          })
          .catch(console.log);
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch((err) => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === ('signout')){
      this.setState(initialState);
    }
    else if( route === 'home'){
      this.setState({isSignedIn: true});
    }
    this.setState({ route: route});
  }

  render(){
    const { isSignedIn, box, route, imageUrl } = this.state;

    return (
      <div className="App">
        <Particles className="particles"
        params={particlesOptions} />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        {
          route === 'home' ? 
          <div>
            <Logo /> 
            <Rank name={this.state.user.name} 
              entries={this.state.user.entries}/>
            <ImageLinkForm onInputChange={this.onInputChange}
              onButtonSubmit={this.onSubmit}/>
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div> :
            (route === 'signin' ? 
            <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />:
            <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> )
        }
      </div>
    );
  }
}

export default App;
