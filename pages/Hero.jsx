import React, {useEffect, useRef, useState} from 'react'
import styles from "./style";
import { discount, robot } from "../public/assets/index";
import { useFormik } from "formik";
import Image from "next/image";
import * as Yup from "yup";
import { Search, GpsFixed } from '@material-ui/icons';
import  MultiSelect  from './MultipleSelectChip';
import CustomizedSlider from './CustomizedSlider';
const apiKey = "AIzaSyBzXACCy452kFDxLcouC9wOn21bFkCCH44";
const mapApiJs = 'https://maps.googleapis.com/maps/api/js';
const geocodeJson = 'https://maps.googleapis.com/maps/api/geocode/json';

const shifts = [
  'Morning',
  'Afternoon',
  'Evening',
  'Overnight',
];
const days = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",

]
// load google map api js

function loadAsyncScript(src) {
  return new Promise(resolve => {
    const script = document.createElement("script");
    Object.assign(script, {
      type: "text/javascript",
      async: true,
      src
    })
    script.addEventListener("load", () => resolve(script));
    document.head.appendChild(script);
  })
}

const extractAddress = (place) => {

  const address = {
    city: "",
    state: "",
    zip: "",
    country: "",
    plain() {
      const city = this.city ? this.city + ", " : "";
      const zip = this.zip ? this.zip + ", " : "";
      const state = this.state ? this.state + ", " : "";
      return city + zip + state + this.country;
    }
  }

  if (!Array.isArray(place?.address_components)) {
    return address;
  }

  place.address_components.forEach(component => {
    const types = component.types;
    const value = component.long_name;

    if (types.includes("locality")) {
      address.city = value;
    }

    if (types.includes("administrative_area_level_2")) {
      address.state = value;
    }

    if (types.includes("postal_code")) {
      address.zip = value;
    }

    if (types.includes("country")) {
      address.country = value;
    }

  });

  return address;
}

const Hero = () => {
  

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      country: "United Kingdom",
      terms: "",
    },

    validationSchema: Yup.object({
      name: Yup.string()
        .max(20, "Name must be 20 characters or less.")
        .required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      terms: Yup.array().required("Terms of service must be checked"),
    }),

    onSubmit: (values) => {
      console.log("form submitted");
      console.log(values);
      router.push({ pathname: "/success", query: values });
    },
  });
  //Google Map
  const searchInput = useRef(null);
  const [address, setAddress] = useState({});


  // init gmap script
  const initMapScript = () => {
    // if script already loaded
    if(window.google) {
      return Promise.resolve();
    }
    const apiKey = "AIzaSyBzXACCy452kFDxLcouC9wOn21bFkCCH44" //process.env.REACT_APP_GMAP_API_KEY;
    const src = `${mapApiJs}?key=${apiKey}&libraries=places&v=weekly`;
    console.log("api key ",apiKey)
    return loadAsyncScript(src);
  }

  // do something on address change
  const onChangeAddress = (autocomplete) => {
    const place = autocomplete.getPlace();
    setAddress(extractAddress(place));
  }

  // init autocomplete
  const initAutocomplete = () => {
    if (!searchInput.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(searchInput.current);
    autocomplete.setFields(["address_component", "geometry"]);
    autocomplete.addListener("place_changed", () => onChangeAddress(autocomplete));

  }


  const reverseGeocode = ({ latitude: lat, longitude: lng}) => {
    const apiKey = "AIzaSyBzXACCy452kFDxLcouC9wOn21bFkCCH44"//process.env.REACT_APP_GMAP_API_KEY;
    const url = `${geocodeJson}?key=${apiKey}&latlng=${lat},${lng}`;
    searchInput.current.value = "Getting your location...";
    fetch(url)
        .then(response => response.json())
        .then(location => {
          const place = location.results[0];
          const _address = extractAddress(place);
          setAddress(_address);
          searchInput.current.value = _address.plain();
        })
  }


  const findMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        reverseGeocode(position.coords)
      })
    }
  }





  // load map script after mounted
  useEffect(() => {
    initMapScript().then(() => initAutocomplete())
  }, []);
  return (
    <section id="home" className={`flex md:flex-col flex-row ${styles.paddingY}  mt-5 bg-white   shadow-md`}>
      <form
          onSubmit={formik.handleSubmit}
          className={` ${styles.paddingY} w-full ${styles.paddingX}`}
      >
        <div className={`flex flex-col justify-between items-center w-full`}>
          <div className="flex flex-row items-center py-[6px] px-4 bg-discount-gradient rounded-[10px] mb-2">          
            <h1 className="flex-1 font-poppins font-semibold ss:text-[52px] text-[32px] text-primary ss:leading-[100.8px] leading-[75px]">              
              CREATE ACCOUNT
            </h1>           
            
          </div>
          {/* Name */}
          <div className={`flex flex-col justify-start items-start ${styles.paddingY}  w-full `}>
            <label
                htmlFor="name"
                className={`block font-latoBold text-sm pb-2 pl-0 ${
                  formik.touched.name && formik.errors.name
                    ? "text-red-400"
                    : ""
                } `}
              >
                {formik.touched.name && formik.errors.name
                  ? formik.errors.name
                  : "Name"}
              </label>
              <p className="border-0 shadow-lg text-sm font-latoBold text-red-400 "></p>
              <input
                className="border-0 shadow-lg border-gray-500 p-2 rounded-md w-full focus:border-teal-500 focus:ring-teal-500 "
                type="text"
                name="name"
                placeholder="Enter your name"
                onChange={formik.handleChange}
                value={formik.values.name}
                onBlur={formik.handleBlur}
              />
          </div>
          {/* Profile Photo */}
          <div className={`flex flex-col justify-start items-start ${styles.paddingY}  w-full `}>
            <label
              htmlFor="photo"
              className={`block font-latoBold text-sm pb-2 ${
                formik.touched.photo && formik.errors.photo
                  ? "text-red-400"
                  : ""
              }`}
            >
              {formik.touched.photo && formik.errors.photo
                ? formik.errors.photo
                : "Photo"}
            </label>            
            <input  className="border-0 shadow-lg w-full bg-white"  type='file' onChange={() => {}} />
              
            
            
          </div>
          {/* About me field */}
          <div className={`flex flex-col justify-start items-start ${styles.paddingY}  w-full `}>
           <label
                htmlFor="about"
                className={`block font-latoBold text-sm pb-2 ${
                  formik.touched.about && formik.errors.about
                    ? "text-red-400"
                    : ""
                } `}
              >
                {formik.touched.about && formik.errors.about
                  ? formik.errors.about
                  : "about"}
              </label>
              <p className="text-sm font-latoBold text-red-400 "></p>
              <textarea
                className="border-0 shadow-lg border-gray-500 p-2 rounded-md w-full focus:border-teal-500 focus:ring-teal-500 "
                rows={4} 
                cols={40}
                name="about"
                placeholder="About Me"
                onChange={formik.handleChange}
                value={formik.values.about}
                onBlur={formik.handleBlur}
              />
          </div>
          {/*  Location field */}
          <div className={`flex flex-col justify-start items-start ${styles.paddingY}  w-full `}>
            <label
                htmlFor="location"
                className={`block font-latoBold text-sm pb-2 ${
                  formik.touched.location && formik.errors.location
                    ? "text-red-400"
                    : ""
                } `}
              >
                {formik.touched.location && formik.errors.location
                  ? formik.errors.location
                  : "location"}
              </label>
              <p className="text-sm font-latoBold text-red-400 "></p>
              <div className="relative w-full">
                <span className="absolute pt-3 ml-1 pr-4"><Search className="absolute" /></span>
                <input
                  className="border-0 shadow-lg border-gray-500 p-2 rounded-md w-full focus:border-teal-500 focus:ring-teal-500 pl-6 mr-0"
                  type="text"
                  name="location"
                  placeholder="search location"
                  // onChange={formik.handleChange}
                  // value={formik.values.name}
                  // onBlur={formik.handleBlur}
                  ref={searchInput}
                />
                <butto onClick={findMyLocation} className="relative"><GpsFixed className="absolute mr-3 right-0 mt-3" /></butto>
              </div>
          </div>
          {/* About me field */}
          <div className={`flex flex-col justify-start items-start ${styles.paddingY}  w-full `}>
            <label
                  htmlFor="supportworker"
                  className="block font-latoBold text-sm pb-2"
            >
                  Are you a support worker?
            </label>
            <select
              className="border-0 shadow-lg border-gray-500 p-2 rounded-md w-full focus:border-teal-500 focus:ring-teal-500"
              name="supportworker"
              onChange={formik.handleChange}
              value={formik.values.supportworker}
            >
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          {/* Support worker */}
          <div className={`flex flex-col justify-start items-start ${styles.paddingY}  w-full `}>
            <p  className=" flex-1 font-poppins font-semibold border-0  text-lg   text-primary">
                If you are a support worker, please complete your availability for shifts, if you are seeking support <br />
                please select as days/times you need support.
            </p>
          </div>
          {/* Select Shifts */}
          <div className={`flex flex-col justify-start items-start ${styles.paddingY}  w-full `}>
            <label
              htmlFor="ShiftsWanted"
              className="block font-latoBold text-sm pb-2"
            >
              Shifts Wanted
            </label>
            <MultiSelect names={shifts} label={"Shifts"} />
          </div>
          {/* Select Days */}
          <div className={`flex flex-col justify-start items-start ${styles.paddingY}  w-full `}>
            <label
                htmlFor="DaysWanted"
              className="block font-latoBold text-sm pb-2"
            >
              Days Wanted
            </label>
            <MultiSelect names={days} label={"Days"} />
          </div>
          <div className={`flex flex-col justify-start items-start ${styles.paddingY}  w-full `}>
            <p  className=" flex-1 font-poppins font-semibold border-0  text-lg   text-primary  mx-0 my-0" >Select your usual hourly rate (indication only)
             Negotiate your rate privately</p>
            <CustomizedSlider />
                
          </div>
          <button
            type="submit"
            className="bg-teal-500 font-latoBold text-sm text-primary py-3 mt-6 rounded-lg w-1/4 "
          >
            Submit
          </button>
        </div>

        
      </form>
    </section>
  );
};

export default Hero;