import React,{
useEffect,
useMemo,
useState,
} from "react";

import OutpassModal from "./OutpassModal";

import { apiFetch } from "../utils/api";

export default function RejectedPage(){

const [selected,setSelected]=useState(null);

const [search,setSearch]=useState("");

const [filter,setFilter]=useState("All");

const [sortBy,setSortBy]=useState("latest");

const [loading,setLoading]=useState(true);

const [error,setError]=useState("");

const [data,setData]=useState([]);

const [page,setPage]=useState(1);

const limit=10;

const [pagination,setPagination]=useState({
page:1,
limit:10,
total:0,
totalPages:1,
hasNextPage:false,
hasPrevPage:false,
});

async function fetchRejected(currentPage=page){

try{

setLoading(true);

setError("");

const result=await apiFetch(

`/api/students/hostel-status?page=${currentPage}&limit=${limit}`,

{
method:"POST",

body:JSON.stringify({

outp_status:"Rejected"

})

}

);

setData(

result?.data?.outpasses||[]

);

setPagination(

result?.data?.pagination||

{

page:1,

total:0,

totalPages:1,

hasNextPage:false,

hasPrevPage:false,

}

);

}catch(err){

console.log(err);

setError(

err.message||

"Unable to fetch rejected outpasses"

);

setData([]);

}finally{

setLoading(false);

}

}

useEffect(()=>{

fetchRejected(page);

},[page]);

const processed=useMemo(()=>{

let arr=[...data];

const q=search.toLowerCase();

arr=arr.filter(o=>

o.name?.toLowerCase().includes(q)

||

o.roll_no?.toLowerCase().includes(q)

||

o.department?.toLowerCase().includes(q)

||

o.room?.toLowerCase().includes(q)

||

o.hostel?.toLowerCase().includes(q)

||

o.place_of_visit?.toLowerCase().includes(q)

||

o.purpose?.toLowerCase().includes(q)

);

if(filter!=="All"){

arr=arr.filter(

o=>o.outpass_type===filter

);

}

if(sortBy==="latest"){

arr.sort(

(a,b)=>

new Date(b.created_at)-

new Date(a.created_at)

);

}else{

arr.sort(

(a,b)=>

new Date(a.departure_datetime)-

new Date(b.departure_datetime)

);

}

return arr;

},[

data,

search,

filter,

sortBy,

]);

if(loading){

return(

<div className="flex justify-center items-center h-[70vh]">

<div className="text-lg text-gray-500">

Loading rejected outpasses...

</div>

</div>

);

}

if(error){

return(

<div className="p-8">

<div className="border border-red-200 bg-red-50 rounded-xl p-4 text-red-600">

{error}

</div>

</div>

);

}
return (

<div className="p-6 space-y-5">

{/* ================= HEADER ================= */}

<div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5">

<div>

<h1 className="text-3xl font-bold text-red-700">

Rejected Outpasses

</h1>

<p className="text-sm text-gray-500 mt-1">

Review previously rejected hostel requests

</p>

</div>

<div className="flex gap-3">

<button
onClick={()=>fetchRejected(page)}
className="border rounded-lg px-4 py-2 text-sm bg-white hover:bg-gray-50"
>

Refresh

</button>

<div className="bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold">

Rejected : {pagination.total}

</div>

</div>

</div>

{/* ================= STATS ================= */}

<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

<StatCard
title="Rejected"
value={pagination.total}
/>

<StatCard
title="Current Page"
value={pagination.page}
/>

<StatCard
title="Total Pages"
value={pagination.totalPages}
/>

<StatCard
title="Showing"
value={processed.length}
/>

</div>

{/* ================= FILTERS ================= */}

<div className="bg-white rounded-2xl border shadow-sm p-4">

<div className="grid lg:grid-cols-4 gap-3">

<input
value={search}
onChange={(e)=>setSearch(e.target.value)}
placeholder="Search student..."
className="border rounded-lg px-4 py-2 text-sm outline-none focus:border-red-600"
/>

<select
value={filter}
onChange={(e)=>setFilter(e.target.value)}
className="border rounded-lg px-4 py-2 text-sm"
>

<option>All</option>

<option>Local</option>

<option>Outstation</option>

</select>

<select
value={sortBy}
onChange={(e)=>setSortBy(e.target.value)}
className="border rounded-lg px-4 py-2 text-sm"
>

<option value="latest">

Latest

</option>

<option value="departure">

Departure Time

</option>

</select>

<div className="flex items-center justify-end text-sm text-gray-500">

Showing

<span className="mx-1 font-semibold text-black">

{processed.length}

</span>

of

<span className="mx-1 font-semibold text-black">

{pagination.total}

</span>

records

</div>

</div>

</div>

{/* ================= TABLE ================= */}

<div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">

<table className="w-full">

<thead className="bg-gray-50 border-b">

<tr className="text-left text-sm text-gray-600">

<th className="px-5 py-4">

Student

</th>

<th className="px-5 py-4">

Hostel

</th>

<th className="px-5 py-4">

Room

</th>

<th className="px-5 py-4">

Type

</th>

<th className="px-5 py-4">

Departure

</th>

<th className="px-5 py-4">

Updated

</th>

<th className="px-5 py-4 text-center">

Status

</th>

<th className="px-5 py-4 text-center">

Action

</th>

</tr>

</thead>

<tbody>

{processed.length===0 && (

<tr>

<td
colSpan={8}
className="text-center py-12 text-gray-500"
>

No rejected outpasses found

</td>

</tr>

)}

{processed.map((o)=>(

<tr
key={o.outpass_id || o.id}
className="border-b hover:bg-gray-50 transition"
>

<td className="px-5 py-4">

<div>

<p className="font-semibold">

{o.name}

</p>

<p className="text-xs text-gray-500">

{o.roll_no}

</p>

<p className="text-xs text-gray-400">

{o.department}

</p>

</div>

</td>

<td className="px-5 py-4">

{o.hostel}

</td>

<td className="px-5 py-4">

{o.room||"-"}

</td>

<td className="px-5 py-4">

<span className="px-2 py-1 rounded bg-gray-100 text-xs">

{o.outpass_type}

</span>

</td>

<td className="px-5 py-4 text-sm">

{new Date(
o.departure_datetime
).toLocaleString("en-IN")}

</td>

<td className="px-5 py-4 text-sm text-gray-500">

{new Date(
o.updated_at
).toLocaleString("en-IN")}

</td>

<td className="px-5 py-4 text-center">

<span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">

Rejected

</span>

</td>

<td className="px-5 py-4">

<div className="flex justify-center">

<button
onClick={()=>setSelected(o)}
className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm"
>

View

</button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>
{/* ================= FOOTER ================= */}

<div className="flex flex-col md:flex-row items-center justify-between gap-4">

  <div className="text-sm text-gray-500">

    Showing

    <span className="mx-1 font-semibold text-black">

      {pagination.total === 0
        ? 0
        : (page - 1) * limit + 1}

    </span>

    -

    <span className="mx-1 font-semibold text-black">

      {Math.min(
        page * limit,
        pagination.total
      )}

    </span>

    of

    <span className="mx-1 font-semibold text-black">

      {pagination.total}

    </span>

    rejected requests

  </div>

  <div className="flex items-center gap-2">

    <button
      disabled={!pagination.hasPrevPage}
      onClick={() =>
        setPage(page - 1)
      }
      className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >

      Previous

    </button>

    {Array.from(
      {
        length: pagination.totalPages,
      },
      (_, i) => i + 1
    )
      .slice(
        Math.max(page - 3, 0),
        Math.min(
          page + 2,
          pagination.totalPages
        )
      )
      .map((p) => (

        <button
          key={p}
          onClick={() =>
            setPage(p)
          }
          className={`w-10 h-10 rounded-lg text-sm transition ${
            page === p
              ? "bg-red-700 text-white"
              : "border hover:bg-gray-100"
          }`}
        >

          {p}

        </button>

      ))}

    <button
      disabled={!pagination.hasNextPage}
      onClick={() =>
        setPage(page + 1)
      }
      className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >

      Next

    </button>

  </div>

</div>

{/* ================= MODAL ================= */}

{selected && (

  <OutpassModal
    outpass={selected}
    onClose={() =>
      setSelected(null)
    }
  />

)}

</div>

);

}

/* ================= STAT CARD ================= */

function StatCard({

title,

value,

}){

return(

<div className="bg-white border rounded-2xl shadow-sm p-5">

<p className="text-xs uppercase tracking-wide text-gray-500">

{title}

</p>

<h2 className="text-2xl font-bold text-red-700 mt-2">

{value}

</h2>

</div>

);

}

/* ================= INFO ================= */

function Info({

label,

value,

}){

return(

<div>

<p className="text-xs text-gray-500">

{label}

</p>

<p className="font-medium text-gray-800">

{value || "-"}

</p>

</div>

);

}