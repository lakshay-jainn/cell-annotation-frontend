import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate, Navigate } from "react-router-dom";
import { ROUTES } from "../../../utils/constants.js";

export default function HomePage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(ROUTES.LOGIN, { replace: true });
  }, []);
  return (
    <Navigate to={ROUTES.LOGIN} replace={true} />
    // <div className="max-w-6xl mx-auto px-4 py-12">
    //             {/* Hero Section */}
    //             <div className="text-center mb-16">
    //               <h1 className="text-5xl font-bold text-slate-800 mb-6">EBUS - TBNA</h1>
    //               <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
    //                 An Image Aquisition System
    //               </p>
    //             </div>

    //             {/* Role Cards */}
    //             <div className="grid md:grid-cols-2 gap-8 mb-12">
    //               {/* Pulmonologist Card */}
    //               <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
    //                 <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
    //                   <h2 className="text-2xl font-bold text-white mb-2">Pulmonologist Portal</h2>
    //                   <p className="text-blue-100">Sample Collection & Documentation</p>
    //                 </div>
    //                 <div className="p-6">
    //                   <div className="mb-6">
    //                     <h3 className="text-lg font-semibold text-slate-800 mb-3">Key Responsibilities:</h3>
    //                     <ul className="space-y-2 text-slate-600">
    //                       <li className="flex items-start">
    //                         <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
    //                         Perform bronchoscopy and lymph node sampling procedures
    //                       </li>
    //                       <li className="flex items-start">
    //                         <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
    //                         Document sample collection details and patient information
    //                       </li>
    //                       <li className="flex items-start">
    //                         <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
    //                         Capture and upload microscopic images for analysis
    //                       </li>
    //                       <li className="flex items-start">
    //                         <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
    //                         Specify needle sizes, staining methods, and magnification settings
    //                       </li>
    //                     </ul>
    //                   </div>
    //                   <Link
    //                     to="/pulmonologist"
    //                     state={{ currentUserType: "pulmonologist" }}
    //                     className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center block"
    //                   >
    //                     Access Pulmonologist Portal →
    //                   </Link>
    //                 </div>
    //               </div>

    //               {/* Pathologist Card */}
    //               <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
    //                 <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
    //                   <h2 className="text-2xl font-bold text-white mb-2">Pathologist Portal</h2>
    //                   <p className="text-green-100">Sample Analysis & Diagnosis</p>
    //                 </div>
    //                 <div className="p-6">
    //                   <div className="mb-6">
    //                     <h3 className="text-lg font-semibold text-slate-800 mb-3">Key Responsibilities:</h3>
    //                     <ul className="space-y-2 text-slate-600">
    //                       <li className="flex items-start">
    //                         <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
    //                         Review and analyze collected tissue samples
    //                       </li>
    //                       <li className="flex items-start">
    //                         <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
    //                         Filter samples by lymph node station, needle size, and type
    //                       </li>
    //                       <li className="flex items-start">
    //                         <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
    //                         Examine microscopic images for diagnostic findings
    //                       </li>
    //                       <li className="flex items-start">
    //                         <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
    //                         Provide detailed pathological reports and recommendations
    //                       </li>
    //                     </ul>
    //                   </div>
    //                   <Link
    //                     to="/pathiologist"
    //                     state={{ currentUserType: "pathologist" }}
    //                     className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center block"
    //                   >
    //                     Access Pathologist Portal →
    //                   </Link>
    //                 </div>
    //               </div>
    //             </div>

    //             {/* Features Section */}
    //             <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
    //               <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">System Features</h3>
    //               <div className="grid md:grid-cols-3 gap-6">
    //                 <div className="text-center">
    //                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
    //                     <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                       <path
    //                         strokeLinecap="round"
    //                         strokeLinejoin="round"
    //                         strokeWidth={2}
    //                         d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    //                       />
    //                     </svg>
    //                   </div>
    //                   <h4 className="font-semibold text-slate-800 mb-2">Digital Documentation</h4>
    //                   <p className="text-slate-600 text-sm">Comprehensive sample tracking and metadata recording</p>
    //                 </div>
    //                 <div className="text-center">
    //                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
    //                     <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                       <path
    //                         strokeLinecap="round"
    //                         strokeLinejoin="round"
    //                         strokeWidth={2}
    //                         d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    //                       />
    //                     </svg>
    //                   </div>
    //                   <h4 className="font-semibold text-slate-800 mb-2">Image Management</h4>
    //                   <p className="text-slate-600 text-sm">High-resolution microscopic image capture and storage</p>
    //                 </div>
    //                 <div className="text-center">
    //                   <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
    //                     <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                       <path
    //                         strokeLinecap="round"
    //                         strokeLinejoin="round"
    //                         strokeWidth={2}
    //                         d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    //                       />
    //                     </svg>
    //                   </div>
    //                   <h4 className="font-semibold text-slate-800 mb-2">Advanced Filtering</h4>
    //                   <p className="text-slate-600 text-sm">Sophisticated search and filtering capabilities</p>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
  );
}
