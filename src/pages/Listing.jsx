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
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

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
        <div className="w-full ">
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
          <ul className="flex items-center mb-6 space-x-2 text-sm font-semibold lg:space-x-10">
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
          {listing.userRef !== auth.currentUser?.uid && !contactLandlord && (
            <div className="mt-6">
              <button
                onClick={() => setContactLandlord(true)}
                className="w-full py-3 text-sm font-medium text-center text-white uppercase transition duration-150 ease-in-out bg-blue-600 rounded shadow-md px-7 hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg "
              >
                Contact Landlord
              </button>
            </div>
          )}
          {contactLandlord && (
            <Contact userRef={listing.userRef} listing={listing} />
          )}
          {/* 使用 useState hook 来定义了一个名为 contactLandlord 的状态以及用于更新该状态的函数 setContactLandlord。初始状态为 false，表示默认情况下用户还没有点击 "Contact Landlord" 按钮。

在 JSX 中，根据条件渲染了两个部分：

第一个部分是一个按钮 "Contact Landlord"，它会在用户点击后改变 contactLandlord 状态为 true，从而触发下一部分的渲染。

第二个部分是一个 Contact 组件，它会在 contactLandlord 状态为 true 时渲染，向房东发送联系信息。

现在让我逐步解释这段代码的逻辑：

{listing.userRef !== auth.currentUser?.uid && !contactLandlord && (...)}: 这部分代码是一个条件渲染的逻辑。它首先检查 listing.userRef 是否等于当前用户的 uid，并且确保 contactLandlord 状态为 false。如果这些条件都满足，则渲染 "Contact Landlord" 按钮。

<button onClick={() => setContactLandlord(true)} ...>: 这是 "Contact Landlord" 按钮的 JSX 定义。当用户点击按钮时，会触发 setContactLandlord(true)，从而将 contactLandlord 状态更新为 true，接着触发重新渲染。

{contactLandlord && (...)}: 这部分代码是另一个条件渲染的逻辑。它检查 contactLandlord 状态是否为 true。如果是 true，则渲染 <Contact userRef={listing.userRef} listing={listing} />，即联系房东的组件。 */}
        </div>

        <div className="w-full h-[200px] md:h-[400px] z-10 overflow-x-hidden mt-6 md:mt-0 md:ml-2">
          <MapContainer
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              {/* 这里lat和lng是under geolocation的在数据库里 */}
              <Popup>{listing.address}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </main>
  );
}
