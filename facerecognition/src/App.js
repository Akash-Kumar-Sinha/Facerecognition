import React, { Component } from 'react'
import './App.css';
import Navigation from './Component/Navigation/Navigation';
import Signin from './Component/Signin/Signin';
import Register from './Component/Register/Register';
import FaceRecog from './Component/FaceRecog/FaceRecog';
import Logo from './Component/Logo/Logo';
import ImageLinkForm from './Component/ImageLinkForm/ImageLinkForm';
import Rank from './Component/Rank/Rank';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; 

    const clarifaiSetUp = (imageUrl) => {
        
        const PAT = '55511461f1da4e81919f52693c658a1e';
        const USER_ID = 'hoyledxst5hh';       
        const APP_ID = 'my-first-application-gbdis';
        // const MODEL_ID = 'face-detection';
        const IMAGE_URL = imageUrl;

        const raw = JSON.stringify({
            "user_app_id": {
                "user_id": USER_ID,
                "app_id": APP_ID
            },
            "inputs": [
                {
                    "data": {
                        "image": {
                            "url": IMAGE_URL
                        }
                    }
                }
            ]
        });

        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Key ' + PAT
            },
            body: raw
        };

        return requestOptions;
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
            entries: 0,
            joined: ''
        }
    }

class App extends Component {

    constructor(){
        super();
        this.state=initialState;
    }
    
    loadUser = (data) => {
        this.setState({user: {
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined
            }
        })
    }

    claculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        // console.log(width, height, clarifaiFace.left_col);

        return{
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
        }
    }

    displayFaceBox = (box) => {
        // console.log(box);
        this.setState({box: box})
    }

    onInputChange = (event) => {
        this.setState({input: event.target.value});
    }

    onButtonSubmit = () =>{
        this.setState({imageUrl: this.state.input})
        fetch("https://api.clarifai.com/v2/models/" + 'face-detection' + "/outputs", clarifaiSetUp(this.state.input))
        .then(response => response.json())
        .then(response => {
            if(response) {
                fetch('http://localhost:3000/image',{
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        id: this.state.user.id
            })
                })
                .then(response => response.json())
                .then(count => {
                    this.setState(Object.assign(this.state.user, {entries: count}))
                })
                
            }
            this.displayFaceBox(this.claculateFaceLocation(response));
        })
        .catch(err => console.log(err));
    }

particlesInit = async engine => {
    // console.log(engine);
    await loadSlim(engine);
};

particlesLoaded = async container => {
    // await console.log(container);
};

onRouteChange = (route) => {
    if(route === 'signout'){
        this.setState({isSignedIn: false})
    }
    else if(route === 'home'){
        this.setState({isSignedIn: true})
    }

    this.setState({route: route});
}

render(){
  return (
    <div className="App">   

        <Particles
                className='particles'
                id="tsparticles"
                init={this.particlesInit}
                loaded={this.particlesLoaded}
                options={{
                background: {
                    color: "transparent", 
                },
                fpsLimit: 120,
                particles: {
                    color: {
                        value: "#ffffff",
                    },
                    links: {
                        color: "#ffffff",
                        distance: 150,
                        enable: true,
                        opacity: 0.3,
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: false,
                        speed: 3,
                        straight: false,
                    },
                    
                    number: {
                        density: {
                            enable: true,
                            area: 400,
                        },
                        value: 60,
                    },
                    opacity: {
                        value: 0.4,
                    },
                    shape: {
                        type: "polygon",
                    },
                    size: {
                        value: { min: 1, max: 3 },
                    },
                },
                detectRetina: true,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: "repulse",
                        },
                        onClick: {
                            enable: true,
                            mode: "push",
                        },
                    },
                },
            }} 
        />
      
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        {this.state.route === 'home'
            ? <div>
                <Logo />
                <Rank
                    name={this.state.user.name}
                    entries={this.state.user.entries}
                />
                <ImageLinkForm 
                    onInputChange={this.onInputChange} 
                    onButtonSubmit={this.onButtonSubmit} 
                />
                <FaceRecog
                    box={this.state.box}
                    imageUrl={this.state.imageUrl}
                />
                </div>
                : (this.state.route === 'signin'
                ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                )
        }
    </div>
  );}
}


export default App;
 