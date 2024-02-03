import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { FcHome } from "react-icons/fc";
import ListingItem from "../components/ListingItem";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] = useState(false);
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const { name, email } = formData;
  //1. got information from the auth and put it inside the form data
  //2. but just remember that you cannot get it directly need to wait until come from auth, so add the middle ware
  function onLogout() {
    auth.signOut();
    navigate("/");
  }

  function editDetail() {
    changeDetail && onSubmit();
    setChangeDetail((prevState) => !prevState);
  }
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value, //id is name or email under, whatever the value change, it's going to apply the setFormData
    }));
  }

  async function onSubmit() {
    try {
      if (auth.currentUser.displayName !== name) {
        //update the display name in firebase auth
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
        //update the name in the firestore
        const docRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(docRef, {
          name,
        });
      }
      toast.success("Profile details updated");
    } catch (error) {
      toast.error("Could not update the profile detail");
    }
  }

  useEffect(() => {
    async function fetchUserListings() {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      let listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings(listings);
      setLoading(false);
    }
    fetchUserListings();
  }, [auth.currentUser.uid]);
  /**
   * useEffect(() => { ... }, [auth.currentUser.uid]);: 这里使用了useEffect hook来处理副作用。它接受一个函数作为第一个参数，这个函数包含了需要进行的副作用操作。第二个参数是一个依赖数组，表示只有当数组中的依赖发生变化时，才会重新执行useEffect中的函数。在这个例子中，只有auth.currentUser.uid发生变化时，才会重新执行useEffect。
   * async function fetchUserListings() { ... }: 这是一个异步函数fetchUserListings，它用于从数据库中获取当前用户的列表数据。
   * const listingRef = collection(db, "listings");: 这行代码创建了一个指向 "listings" 集合的引用。
   * const q = query(listingRef, ...);: 这行代码创建了一个查询，查询 "listings" 集合中userRef字段等于当前用户的uid的文档，并按照timestamp字段降序排列。
   * const querySnap = await getDocs(q);: 这行代码执行了查询操作，并等待获取到查询结果。getDocs 函数用于获取查询的快照。
   * let listings = [];: 这行代码创建了一个空数组listings，用于存储查询结果中的文档数据。
   * querySnap.forEach((doc) => { ... });: 这是一个遍历查询结果的循环，它将查询结果中的每个文档转换为一个对象，包含文档的ID和数据，然后将这些对象添加到listings数组中。
   * setListings(listings);: 这行代码使用setListings函数将获取到的列表数据设置到组件的状态中，以便在组件中使用。
   * setLoading(false);: 最后，将加载状态设置为 false，表示数据加载完成。
   */

  return (
    <>
      <section className="flex flex-col items-center justify-center max-w-6xl mx-auto">
        <h1 className="mt-6 text-3xl font-bold text-center ">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3 ">
          <form>
            {/* Name Input */}
            <input
              type="text"
              id="name"
              value={name}
              disabled={!changeDetail}
              onChange={onChange}
              className={`w-full px-4 py-2 mb-6 text-xl text-gray-700 transition ease-in-out bg-white border border-gray-300 rounded ${
                changeDetail && "bg-red-200 focus:bg-red-200"
              }`}
            />
            {/* Email input */}
            <input
              type="email"
              id="email"
              value={email}
              disabled
              className="w-full px-4 py-2 mb-6 text-xl text-gray-700 transition ease-in-out bg-white border border-gray-300 rounded"
            />

            <div className="flex justify-between mb-6 text-sm whitespace-nowrap sm:text-lg">
              <p className="flex items-center ">
                Do you want to change your name?
                <span
                  onClick={editDetail} //make this one a function and return it
                  className="ml-1 text-red-600 transition duration-200 ease-in-out cursor-pointer hover:text-red-700"
                >
                  {changeDetail ? "Apply change" : "Edit"}
                </span>
              </p>
              <p
                onClick={onLogout}
                className="text-blue-600 transition duration-200 ease-in-out cursor-pointer hover:text-blue-800"
              >
                Sign Out
              </p>
            </div>
          </form>
          <button
            type="submit"
            className="w-full py-3 text-sm font-medium text-white uppercase transition duration-150 ease-in-out bg-blue-600 rounded shadow-md px-7 hover:bg-blue-700 hover:shadow-lg active:bg-blue-800"
          >
            <Link
              to="/create-listing"
              className="flex items-center justify-center"
            >
              <FcHome className="p-1 mr-2 text-3xl bg-red-200 border-2 rounded-full" />
              Sell or rent your home
            </Link>
          </button>
        </div>
      </section>
      <div className="max-w-6xl px-3 mx-auto mt-6">
        {!loading &&
          listings.length > 0 && ( //这里因为上来执行fetchUserListings（after the data fetch)，loading从开始的true变成false了，这里再反转就能&&
            <>
              <h2 className="mb-6 text-2xl font-semibold text-center">
                My Listings
              </h2>
              <ul className="grid-cols-2 sm:grid lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {/* grid-cols-2: 表示在网格布局中，每行有两列。
                    sm:grid: 在小屏幕尺寸上（sm 表示小屏幕），使用网格布局。
                    lg:grid-cols-3: 在大屏幕尺寸上（lg 表示大屏幕），每行有三列。
                    xl:grid-cols-4: 在超大屏幕尺寸上（xl 表示超大屏幕），每行有四列。
                    2xl:grid-cols-5: 在超超大屏幕尺寸上（2xl 表示超超大屏幕），每行有五列。 */}
                {listings.map((listing) => (
                  <ListingItem
                    key={listing.id}
                    id={listing.id}
                    listing={listing.data}
                    // onDelete={() => onDelete(listing.id)}
                    // onEdit={() => onEdit(listing.id)}
                  />
                ))}
              </ul>
            </>
          )}
      </div>
    </>
  );
}
