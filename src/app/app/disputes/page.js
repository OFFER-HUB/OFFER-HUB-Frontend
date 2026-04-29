"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DisputesPage;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var link_1 = require("next/link");
var cn_1 = require("@/lib/cn");
var mode_store_1 = require("@/stores/mode-store");
var auth_store_1 = require("@/stores/auth-store");
var Icon_1 = require("@/components/ui/Icon");
var EmptyState_1 = require("@/components/ui/EmptyState");
var LoadingState_1 = require("@/components/ui/LoadingState");
var ErrorState_1 = require("@/components/ui/ErrorState");
var DisputeCard_1 = require("@/components/disputes/DisputeCard");
var disputes_1 = require("@/lib/api/disputes");
var styles_1 = require("@/lib/styles");
var STATUS_FILTERS = ["all", "open", "under_review", "resolved", "closed"];
function getTabLabel(status) {
    if (status === "all")
        return "All";
    if (status === "under_review")
        return "Under Review";
    return status.charAt(0).toUpperCase() + status.slice(1);
}
function DisputesContent() {
    var searchParams = (0, navigation_1.useSearchParams)();
    var setMode = (0, mode_store_1.useModeStore)().setMode;
    var token = (0, auth_store_1.useAuthStore)(function (state) { return state.token; });
    var _a = (0, react_1.useState)(false), mounted = _a[0], setMounted = _a[1];
    var _b = (0, react_1.useState)("all"), filter = _b[0], setFilter = _b[1];
    var _c = (0, react_1.useState)(false), showSuccessMessage = _c[0], setShowSuccessMessage = _c[1];
    var _d = (0, react_1.useState)([]), disputes = _d[0], setDisputes = _d[1];
    var _e = (0, react_1.useState)(true), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var _g = (0, react_1.useState)(1), page = _g[0], setPage = _g[1];
    var _h = (0, react_1.useState)(false), hasMore = _h[0], setHasMore = _h[1];
    var _j = (0, react_1.useState)(false), isLoadingMore = _j[0], setIsLoadingMore = _j[1];
    var _k = (0, react_1.useState)(0), refreshKey = _k[0], setRefreshKey = _k[1];
    (0, react_1.useEffect)(function () {
        setMounted(true);
        if (searchParams.get("created") === "true") {
            setShowSuccessMessage(true);
            setTimeout(function () { return setShowSuccessMessage(false); }, 5000);
        }
    }, [searchParams]);
    (0, react_1.useEffect)(function () {
        setMode("client");
    }, [setMode]);
    (0, react_1.useEffect)(function () {
        if (!mounted)
            return;
        function fetchDisputes() {
            return __awaiter(this, void 0, void 0, function () {
                var result, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setIsLoading(true);
                            setError(null);
                            setPage(1);
                            setDisputes([]);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, (0, disputes_1.listDisputes)(token, {
                                    status: filter === "all" ? undefined : filter,
                                    page: 1,
                                    limit: 10,
                                })];
                        case 2:
                            result = _a.sent();
                            setDisputes(result.data);
                            setHasMore(result.hasMore);
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _a.sent();
                            setError(err_1 instanceof Error ? err_1.message : "Failed to load disputes");
                            return [3 /*break*/, 5];
                        case 4:
                            setIsLoading(false);
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        fetchDisputes();
    }, [mounted, token, filter, refreshKey]);
    function handleLoadMore() {
        return __awaiter(this, void 0, void 0, function () {
            var nextPage, result_1, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (isLoadingMore)
                            return [2 /*return*/];
                        nextPage = page + 1;
                        setIsLoadingMore(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, disputes_1.listDisputes)(token, {
                                status: filter === "all" ? undefined : filter,
                                page: nextPage,
                                limit: 10,
                            })];
                    case 2:
                        result_1 = _a.sent();
                        setDisputes(function (prev) { return __spreadArray(__spreadArray([], prev, true), result_1.data, true); });
                        setHasMore(result_1.hasMore);
                        setPage(nextPage);
                        return [3 /*break*/, 5];
                    case 3:
                        err_2 = _a.sent();
                        setError(err_2 instanceof Error ? err_2.message : "Failed to load more disputes");
                        return [3 /*break*/, 5];
                    case 4:
                        setIsLoadingMore(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function handleFilterChange(status) {
        if (status !== filter) {
            setFilter(status);
        }
    }
    return (<div className="space-y-6">
      {showSuccessMessage && (<div className={(0, cn_1.cn)("flex items-center gap-3 p-4 rounded-xl", "bg-success/10 border border-success/20")}>
          <Icon_1.Icon path={Icon_1.ICON_PATHS.check} size="md" className="text-success"/>
          <p className="text-success font-medium">
            Your dispute has been submitted successfully. We will review it shortly.
          </p>
          <button onClick={function () { return setShowSuccessMessage(false); }} className="ml-auto text-success hover:text-success/80 cursor-pointer">
            <Icon_1.Icon path={Icon_1.ICON_PATHS.close} size="sm"/>
          </button>
        </div>)}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Disputes</h1>
          <p className="text-text-secondary mt-1">
            Manage and track your dispute cases
          </p>
        </div>
        <link_1.default href="/app/disputes/new" className={(0, cn_1.cn)("inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl", "bg-primary text-white font-semibold", "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]", "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]", "transition-all duration-200")}>
          <Icon_1.Icon path={Icon_1.ICON_PATHS.plus} size="md"/>
          Open Dispute
        </link_1.default>
      </div>

      <div className={styles_1.NEUMORPHIC_CARD}>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(function (status) { return (<button key={status} type="button" onClick={function () { return handleFilterChange(status); }} className={(0, cn_1.cn)("px-4 py-2 rounded-lg text-sm font-medium", "transition-all duration-200 cursor-pointer", filter === status
                ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                : "bg-background text-text-secondary hover:text-text-primary shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]")}>
              {getTabLabel(status)}
            </button>); })}
        </div>
      </div>

      <div className={(0, cn_1.cn)("rounded-2xl p-4", "bg-white", "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]")}>
        {isLoading ? (<LoadingState_1.LoadingState message="Loading disputes..."/>) : error ? (<ErrorState_1.ErrorState message={error} onRetry={function () { return setRefreshKey(function (k) { return k + 1; }); }}/>) : disputes.length === 0 ? (<EmptyState_1.EmptyState icon={Icon_1.ICON_PATHS.flag} message={filter === "all"
                ? "No disputes found"
                : "No ".concat(getTabLabel(filter).toLowerCase(), " disputes")} linkHref="/app/disputes/new" linkText="Open a dispute"/>) : (<div className="space-y-4">
            {disputes.map(function (dispute) { return (<DisputeCard_1.DisputeCard key={dispute.id} dispute={dispute}/>); })}
            {hasMore && (<div className="flex justify-center pt-2">
                <button type="button" onClick={handleLoadMore} disabled={isLoadingMore} className={(0, cn_1.cn)(styles_1.PRIMARY_BUTTON, "disabled:opacity-50")}>
                  {isLoadingMore && (<Icon_1.LoadingSpinner size="sm" className="text-primary"/>)}
                  {isLoadingMore ? "Loading..." : "Load More"}
                </button>
              </div>)}
          </div>)}
      </div>
    </div>);
}
function LoadingFallback() {
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-background rounded animate-pulse"/>
          <div className="h-5 w-48 bg-background rounded animate-pulse"/>
        </div>
        <div className="h-10 w-36 bg-background rounded-xl animate-pulse"/>
      </div>
      <div className={(0, cn_1.cn)(styles_1.NEUMORPHIC_CARD, "h-14 animate-pulse")}/>
      <div className={(0, cn_1.cn)(styles_1.NEUMORPHIC_CARD, "h-32 animate-pulse")}/>
      <div className={(0, cn_1.cn)(styles_1.NEUMORPHIC_CARD, "h-32 animate-pulse")}/>
    </div>);
}
function DisputesPage() {
    return (<react_1.Suspense fallback={<LoadingFallback />}>
      <DisputesContent />
    </react_1.Suspense>);
}
