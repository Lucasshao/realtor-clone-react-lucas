import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaShare,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaParking,
  FaChair,
} from "react-icons/fa";
import { getAuth } from "firebase/auth";
import Contact from "../components/Contact";
import { list } from "postcss";
// import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export default function Listing() {
  const auth = getAuth();
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [contactLandlord, setContactLandlord] = useState(false);
  // SwiperCore.use([Autoplay, Navigation, Pagination]);
  useEffect(() => {
    async function fetchListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setLoading(false);
      }
    }
    fetchListing();
  }, [params.listingId]);
  /**
   * useParams() hook 用于从 React Router 中获取路由参数。在这个例子中，它用来获取 listingId 参数。
   * 在 useEffect() hook 中，当组件加载时，它会执行一个异步函数 fetchListing()，该函数使用 listingId 作为参数来获取特定的列表项数据。
   * 在 fetchListing() 函数中，首先根据 listingId 构建了对应的文档引用 docRef，然后使用 getDoc() 函数从数据库中获取文档快照 docSnap。
   * 如果文档存在（即 docSnap.exists() 返回 true），则通过 docSnap.data() 获取文档数据，并使用 setListing() 将数据设置到组件的状态中。
   * 当数据加载完成后，将 loading 状态设置为 false，表示数据已加载完成。
   * 如果 loading 状态为 true，则显示一个加载动画 <Spinner />，表示数据正在加载中。
   * 如果 loading 状态为 false，则返回渲染列表项数据的内容。
   * */
  if (loading) {
    return <Spinner />;
  }
  return (
    <main>
      <Swiper
        slidesPerView={1}
        modules={[EffectFade, Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ type: "progressbar" }}
        effect="fade"
        autoplay={{ delay: 3000 }}
      >
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative w-full overflow-hidden h-[300px]"
              style={{
                background: `url(${listing.imgUrls[index]}) center no-repeat`,
                backgroundSize: "cover",
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="fixed top-[13%] right-[3%] z-10 bg-white cursor-pointer border-2 border-gray-400 rounded-full w-12 h-12 flex justify-center items-center"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <FaShare className="text-lg text-slate-500" />
      </div>
      {shareLinkCopied && (
        <p className="fixed top-[23%] right-[5%] font-semibold border-2 border-gray-400 rounded-md bg-white z-10 p-2">
          Link Copied
        </p>
      )}

      <div className="flex flex-col max-w-6xl p-4 m-4 bg-white rounded-lg shadow-lg md:flex-row lg:mx-auto lg:space-x-5">
        <div className=" w-full h-[200px] lg-[400px]">
          <p className="mb-3 text-2xl font-bold text-blue-900">
            {listing.name} - ${" "}
            {listing.offer
              ? listing.discountedPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            {listing.type === "rent" ? " / month" : ""}
          </p>
          <p className="flex items-center mt-6 mb-3 font-semibold ">
            <FaMapMarkerAlt className="mr-1 text-green-700 " />
            {listing.address}
          </p>
          <div className="flex justify-start items-center space-x-4 w-[75%] ">
            <p className="bg-red-800 w-full max-w-[200px] rounded-md p-1 text-white text-center font-semibold shadow-md">
              {listing.type === "rent" ? "Rent" : "Sale"}
            </p>
            <p className="w-full max-w-[200px] bg-green-800 rounded-md p-1 text-white text-center font-semibold shadow-md">
              {" "}
              {listing.offer && (
                <p>
                  ${+listing.regularPrice - +listing.discountedPrice} discount
                </p>
              )}
            </p>
          </div>
          <p className="mt-3 mb-3 ">
            <span className="font-semibold "> Description - </span>
            {listing.description}
          </p>
          <ul className="flex items-center space-x-2 text-sm font-semibold lg:space-x-10">
            <li className="flex items-center whitespace-nowrap">
              <FaBed className="mr-1 text-lg " />
              {+listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaBath className="mr-1 text-lg " />
              {+listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : "1 Bath"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaParking className="mr-1 text-lg " />
              {listing.parking ? "Parking Spot" : "No Parking"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaChair className="mr-1 text-lg " />
              {listing.furnished ? "Furnished" : "Not furnished"}
            </li>
          </ul>
        </div>

        <div className="bg-blue-300 w-full h-[200px] lg-[400px] z-10 overflow-x-hidden"></div>
      </div>
    </main>
  );
}
