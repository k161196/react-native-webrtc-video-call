// import Socket from 'socket.io-client';
import io from 'socket.io-client';
import {StyleSheet, View, TextInput, Button} from 'react-native';
import React, {useRef, useState, useEffect, useMemo} from 'react';
import {
  RTCView,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';

const config = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302'],
    },
  ],
};

const styles = StyleSheet.create({
  viewer: {
    flex: 1,
    display: 'flex',
    backgroundColor: '#4F4',
  },
});

const SecandApp = ({roomId}) => {
  console.log('roomid' + roomId);
  // you have to keep the peer connections without re-rendering
  // every time a peer connects/disconnects
  const peerConnections = useRef(new Map());
  const [stream, setStream] = useState(null);
  const [userStreamState, setuserStreamState] = useState(null);
  const [patnerStreamState, setPatnerStreamState] = useState(null);

  // const [socket] = useState(Socket.connect('ws://192.168.43.186:4000')); // replace with your host machine's IP or public url
  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  const userStream = useRef();
  // useEffect(() => {
  //   console.log('use Effect');

  //   socket.on('connect', () => {
  //     // if (stream) {
  //     //   socket.emit('broadcaster');
  //     //   console.log('stem condition:', stream);
  //     // }
  //     // socket.emit('broadcaster');
  //     // if (stream) {
  //     //   socket.emit('join room', roomId);
  //     // }
  //     if (stream) {
  //       socket.emit('join room', roomId);
  //       console.log('steme:', stream);
  //       socket.on('other user', userID => {
  //         callUser(userID);
  //         otherUser.current = userID;
  //       });
  //       socket.on('user joined', userID => {
  //         otherUser.current = userID;
  //       });
  //       socket.on('offer', handleRecieveCall);
  //       socket.on('answer', handleAnswer);
  //       socket.on('ice-candidate', handleNewICECandidateMsg);
  //     }

  //     // console.log('strem:', stream);

  //     // socket.on('watcher', async id => {
  //     //   const connectionBuffer = new RTCPeerConnection(config);

  //     //   stream.getTracks.forEach(track =>
  //     //     connectionBuffer.addTrack(track, stream),
  //     //   );

  //     //   connectionBuffer.onicecandidate = ({candidate}) => {
  //     //     if (candidate) socket.emit('candidate', id, candidate);
  //     //   };

  //     //   const localDescription = await connectionBuffer.createOffer();

  //     //   await connectionBuffer.setLocalDescription(localDescription);

  //     //   socket.emit('offer', id, connectionBuffer.localDescription);

  //     //   peerConnections.current.set(id, connectionBuffer);
  //     // });

  //     // socket.on('candidate', (id, candidate) => {
  //     //   const candidateBuffer = new RTCIceCandidate(candidate);
  //     //   const connectionBuffer = peerConnections.current.get(id);

  //     //   connectionBuffer.addIceCandidate(candidateBuffer);
  //     // });

  //     // socket.on('answer', (id, remoteOfferDescription) => {
  //     //   const connectionBuffer = peerConnections.current.get(id);

  //     //   connectionBuffer.setRemoteDescription(remoteOfferDescription);
  //     // });

  //     // socket.on('disconnectPeer', id => {
  //     //   peerConnections.current.get(id).close();
  //     //   peerConnections.current.delete(id);
  //     // });
  //   });

  //   return () => {
  //     // if (socket.connected) socket.close(); // close the socket if the view is unmounted
  //   };
  // }, [socket, stream]);

  // useEffect(() => {
  //   if (!stream) {
  //     (async () => {
  //       const availableDevices = await mediaDevices.enumerateDevices();
  //       const {deviceId: sourceId} = availableDevices.find(
  //         // once we get the stream we can just call .switchCamera() on the track to switch without re-negotiating
  //         // ref: https://github.com/react-native-webrtc/react-native-webrtc#mediastreamtrackprototype_switchcamera
  //         device => device.kind === 'videoinput' && device.facing === 'front',
  //       );

  //       const streamBuffer = await mediaDevices.getUserMedia({
  //         audio: true,
  //         video: {
  //           mandatory: {
  //             // Provide your own width, height and frame rate here
  //             minWidth: 500,
  //             minHeight: 300,
  //             minFrameRate: 30,
  //           },
  //           facingMode: 'user',
  //           optional: [{sourceId}],
  //         },
  //       });

  //       console.log('String buffer:', streamBuffer);
  //       userStream.current = streamBuffer;
  //       setStream(streamBuffer);
  //     })();
  //   }
  // }, [stream]);

  useMemo(() => {
    mediaDevices
      .enumerateDevices()
      .then(availableDevices => {
        // console.log('avilable devices :', availableDevices);
        const {deviceId: sourceId} = availableDevices.find(
          // once we get the stream we can just call .switchCamera() on the track to switch without re-negotiating
          // ref: https://github.com/react-native-webrtc/react-native-webrtc#mediastreamtrackprototype_switchcamera
          device => device.kind === 'videoinput' && device.facing === 'front',
        );
        // console.log('sourceId', sourceId);
        mediaDevices
          .getUserMedia({
            audio: true,
            video: {
              mandatory: {
                // Provide your own width, height and frame rate here
                minWidth: 500,
                minHeight: 300,
                minFrameRate: 30,
              },
              facingMode: 'user',
              optional: [{sourceId}],
            },
          })
          .then(stream => {
            // console.log('strem:', stream);
            setuserStreamState(stream);
            // userVideo.current.srcObject = stream;
            userStream.current = stream;
            // console.log('userSTrem.current :', userStream.current);

            // const connectionBuffer = new RTCPeerConnection(config);
            // for (const track of stream.getTracks()) {
            //   // console.log(track);
            //   connectionBuffer.addStream(track);
            // }
            // console.log('stream.getTracks()', stream.getTracks());

            socketRef.current = io.connect('ws://192.168.43.80:4000');
            socketRef.current.emit('join room', roomId);
            socketRef.current.on('other user', userID => {
              console.log('other user', userID);
              callUser(userID);
              otherUser.current = userID;
            });
            socketRef.current.on('user joined', userID => {
              console.log('user join', userID);
              otherUser.current = userID;
            });
            socketRef.current.on('offer', handleRecieveCall);
            socketRef.current.on('answer', handleAnswer);
            socketRef.current.on('ice-candidate', handleNewICECandidateMsg);

            // socketRef.current = io.connect('/');
            // socketRef.current.emit('join room', props.match.params.roomID);
            // setStream(stream);
          });
      })
      .catch(err => console.log(err));

    return () => {};
  }, []);

  function callUser(userID) {
    console.log('call user', userID);
    peerRef.current = createPeer(userID);
    const connectionBuffer = new RTCPeerConnection(config);
    // console.log('stream inside buffer', userStream.current);
    if (peerRef.current) {
      peerRef.current.addStream(userStream.current);
      // userStream.current
      //   .getTracks()
      //   .forEach(track => peerRef.current.addStream(track, userStream.current));
    }
    // userStream.current.getTracks().forEach(track => {
    //   console.log('peerRef.current', peerRef.current);
    //   peerRef.current.addTrack(track, userStream.current);
    // });
  }
  function createPeer(userID) {
    const peer = new RTCPeerConnection(config);
    // console.log('peer', peer);
    peer.onicecandidate = handleICECandidateEvent;
    peer.onaddstream = function(e) {
      console.log('on add stream');
      if (e.stream && patnerStreamState !== e.stream) {
        console.log('RemotePC received the stream', e.stream);
        setPatnerStreamState(e.stream);
      }
    };
    // peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);
    return peer;
  }
  function handleNegotiationNeededEvent(userID) {
    console.log('handleNegotiationNeededEvent', userID);
    peerRef.current
      .createOffer()
      .then(offer => {
        return peerRef.current.setLocalDescription(offer);
      })
      .then(() => {
        const payload = {
          target: userID,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit('offer', payload);
      })
      .catch(e => console.log(e));
  }
  function handleRecieveCall(incoming) {
    console.log('handleRecieveCall');
    peerRef.current = createPeer();
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        peerRef.current.addStream(userStream.current);
        // userStream.current
        //   .getTracks()
        //   .forEach(track =>
        //     peerRef.current.addStream(track, userStream.current),
        //   );
      })
      .then(() => {
        return peerRef.current.createAnswer();
      })
      .then(answer => {
        return peerRef.current.setLocalDescription(answer);
      })
      .then(() => {
        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        console.log('sending awnser');
        socketRef.current.emit('answer', payload);
      });
  }
  function handleAnswer(message) {
    console.log('handleAnswer');
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
  }
  function handleICECandidateEvent(e) {
    console.log('handleICECandidateEvent');
    if (e.candidate) {
      console.log('e.candidate', e.candidate.candidate);
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socketRef.current.emit('ice-candidate', payload);
    }
  }
  function handleNewICECandidateMsg(incoming) {
    console.log('handleNewICECandidateMsg');
    const candidate = new RTCIceCandidate(incoming);
    peerRef.current.addIceCandidate(candidate).catch(e => console.log(e));
  }
  function handleTrackEvent(e) {
    partnerVideo.current.srcObject = e.streams[0];
  }

  // console.log('artnerVideo.current', partnerVideo.current);

  // if (peerRef.current) {
  //   console.log('peer ref', peerRef.current);
  // }
  // console.log('userStreamState', userStreamState?.toURL());
  // console.log('patnerStreamState', patnerStreamState);

  patnerStreamState && console.log('patnerState:', patnerStreamState);
  userStreamState && console.log('userStreamState:', userStreamState);
  return (
    <View style={{flex: 1}}>
      <RTCView streamURL={userStreamState?.toURL()} style={styles.viewer} />
      {patnerStreamState && (
        <RTCView streamURL={patnerStreamState?.toURL()} style={styles.viewer} />
      )}
    </View>
  );
};

const InputHandle = ({setroomId}) => {
  const [InputRoomText, setInputRoomText] = useState('kiran');
  return (
    <View>
      <TextInput
        placeholder={'emter room id'}
        value={InputRoomText}
        onChangeText={text => setInputRoomText(text)}
      />
      <Button
        title={'enter in room'}
        onPress={() => setroomId(InputRoomText)}
      />
    </View>
  );
};

const App = () => {
  const [roomId, setroomId] = useState(null);
  // console.log('main room id' + roomId);
  return (
    <View style={{flex: 1}}>
      <InputHandle setroomId={text => setroomId(text)} />
      {roomId && <SecandApp roomId={roomId} />}
    </View>
  );
};

export default App;
