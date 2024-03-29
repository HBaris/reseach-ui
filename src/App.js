import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
  useToast,
} from "@chakra-ui/react";

import {
  FaBicycle,
  FaBuilding,
  FaBus,
  FaCar,
  FaTimes,
  FaWalking,
} from "react-icons/fa";

import {
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
  useLoadScript,
} from "@react-google-maps/api";

import { useEffect, useRef, useState } from "react";
import PoiListSection from "./components/poiListSection";
import HistoryListSection from "./components/historyListSection";

function App() {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [travelMode, setTravelMode] = useState();
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [visiblePanel, setVisiblePanel] = useState("hidden");

  const sidebar = document.getElementById("sidebar");
  const originRef = useRef();
  const destiantionRef = useRef();

  const toast = useToast();

  useEffect(() => {
    setTravelMode(google.maps.TravelMode.DRIVING);
  }, []);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
    libraries: JSON.parse(process.env.REACT_APP_MAP_LIB),
  });
  if (!isLoaded) {
    return <SkeletonText />;
  }

  async function calculateRoute() {
    setVisiblePanel("visible");
    if (originRef.current.value === "" || destiantionRef.current.value === "") {
      return;
    }
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destiantionRef.current.value,
      travelMode: travelMode,
    });
    setDirectionsResponse(results);
    const leg = results.routes[0].legs[0];
    setDistance(leg.distance.text);
    setDuration(leg.duration.text);
  }

  function clearRoute() {
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destiantionRef.current.value = "";
  }

  // function isTravelMode(mode){
  //   if(travelMode===mode){
  //     return true;
  //   }else{
  //     return false;
  //   }
  // } bu fonksyion karmaşıklığı önlemek amacıyla yazılmıştır ancak gereksiz olarak kabul edilmiştir

  const center = JSON.parse(process.env.REACT_APP_MAP_CENTER);
  const mapOptions = {
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
  };

  return (
    <Flex position="relative" h="100vh" w="100vw">
      <Box position="absolute" right={0} top={0} h="100%" w="100%">
        <GoogleMap
          id="map"
          center={center}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={mapOptions}
        >
          {/* <TransitLayer /> */}
          <Marker position={center} />
          {/* <TrafficLayer position={center} /> */}
          {directionsResponse && (
            <DirectionsRenderer
              panel={sidebar}
              directions={directionsResponse}
            />
          )}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius="lg"
        m={4}
        marginX="auto"
        minH="170px"
        maxH="18%"
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
      >
        <HStack spacing={2} justifyContent="space-between">
          <Box flexGrow={1}>
            <Autocomplete>
              <Input type="text" placeholder="Origin" ref={originRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type="text"
                placeholder="Destination"
                ref={destiantionRef}
              />
            </Autocomplete>
          </Box>
          <ButtonGroup>
            <Button colorScheme="pink" type="submit" onClick={calculateRoute}>
              Rotayı Hesapla
            </Button>
            <IconButton
              aria-label="center back"
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="space-around">
          <Text>Uzaklık: {distance} </Text>
          <Text>Tahmini Süre: {duration} </Text>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="end">
          <IconButton
            icon={<FaBus />}
            isRound
            bg={
              travelMode === google.maps.TravelMode.TRANSIT ? "blue.200" : null
            }
            onClick={() => {
              setTravelMode(google.maps.TravelMode.TRANSIT);
            }}
          />
          <IconButton
            bg={
              travelMode === google.maps.TravelMode.DRIVING ? "blue.200" : null
            }
            icon={<FaCar />}
            isRound
            onClick={() => {
              setTravelMode(google.maps.TravelMode.DRIVING);
            }}
          />
          <IconButton
            icon={<FaWalking />}
            isRound
            bg={
              travelMode === google.maps.TravelMode.WALKING ? "blue.200" : null
            }
            onClick={() => {
              setTravelMode(google.maps.TravelMode.WALKING);
            }}
          />
          <IconButton
            icon={<FaBicycle />}
            isRound
            onClick={() => {
              toast({
                title: "Bilgilendirme",
                description: "Bu araç tipi şuan kullanılamıyor",
                status: "info",
                duration: 2000,
                isClosable: true,
              });
            }}
          />
        </HStack>
      </Box>
      <Accordion
        position="absolute"
        bottom="0"
        defaultIndex={[0]}
        allowMultiple
        w={visiblePanel === "visible" ? "85%" : "100%"}
      >
        <AccordionItem>
          <Heading>
            <AccordionButton bg="yellow.300" justifyContent="center">
              <Box as="span">Popüler Varış Noktaları</Box>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel>
            <Box
              p={4}
              bgColor="white"
              justifyContent="space-around"
              shadow="base"
              display="flex"
              m="auto"
              bg="transparent"
              h="28%"
              zIndex="1"
            >
              <PoiListSection />
              <HistoryListSection />
              <HistoryListSection />
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Box
        visibility={visiblePanel}
        p={4}
        borderRadius="lg"
        bgColor="white"
        shadow="base"
        w="15%"
        h="100%"
        bg={"azure"}
        overflowY={"auto"}
        zIndex="1"
      >
        <div id="sidebar" />
      </Box>
    </Flex>
  );
}

export default App;
