import React, { useCallback, useEffect, useRef, useState } from 'react';
import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';
import { ChartMode, ChartTitle, DrawTools, Share, SmartChart, StudyLegend, ToolbarWidget, Views } from '@deriv/deriv-charts';
import '@deriv/deriv-charts/dist/smartcharts.css';
import { getStoredSymbol, setStoredSymbol, subscribeSymbol } from '@/lib/symbolStore';
import { PREFERRED_ORDER } from '@/hooks/useDerivWS';

const ALLOWED_SYMBOLS = new Set<string>(PREFERRED_ORDER);

const APP_ID = 97574;
const SERVER_URL = 'ws.derivws.com';
const LANGUAGE = 'EN';

function createDerivApi() {
    const socket = new WebSocket(
        `wss://${SERVER_URL}/websockets/v3?app_id=${APP_ID}&l=${LANGUAGE}&brand=deriv`
    );
    return new DerivAPIBasic({ connection: socket });
}

export interface DerivChartProps {
    defaultSymbol?: string;
    defaultChartType?: string;
    defaultGranularity?: number;
    isDarkMode?: boolean;
    height?: string;
    language?: string;
    isMobile?: boolean;
}

const DerivChart: React.FC<DerivChartProps> = ({
    defaultSymbol = 'R_100',
    defaultChartType = 'line',
    defaultGranularity = 0,
    isDarkMode = false,
    height = '500px',
    language = 'en',
    isMobile = false,
}) => {
    const [api, setApi] = useState<any>(null);
    const [symbol, setSymbol] = useState<string>(() => getStoredSymbol() || defaultSymbol);
    const [chartType, setChartType] = useState<string>(defaultChartType);
    const [granularity, setGranularity] = useState<number>(defaultGranularity);
    const subscriptionRef = useRef<any>(null);
    const subscriptionIdRef = useRef<string | null>(null);

    const handleSymbolChange = useCallback((s: string) => {
        setSymbol(s);
        setStoredSymbol(s);
    }, []);

    useEffect(() => {
        return subscribeSymbol((s) => {
            setSymbol((prev) => (prev === s ? prev : s));
        });
    }, []);

    useEffect(() => {
        const handler = (event: PromiseRejectionEvent) => {
            const reason = event.reason;
            const text =
                typeof reason === 'string'
                    ? reason
                    : reason && typeof reason.message === 'string'
                        ? reason.message
                        : '';
            if (
                text.includes('FormatException') ||
                text.includes("Unexpected token '<'") ||
                text.includes('<!DOCTYPE')
            ) {
                event.preventDefault();
            }
        };
        window.addEventListener('unhandledrejection', handler);
        return () => window.removeEventListener('unhandledrejection', handler);
    }, []);

    useEffect(() => {
        const derivApi = createDerivApi();

        const keepAlive = setInterval(() => {
            if (derivApi.connection?.readyState === WebSocket.OPEN) {
                derivApi.send({ time: 1 });
            }
        }, 30000);

        const onClose = () => {
            if (derivApi.connection?.readyState > 1) {
                setApi(null);
                const reconnected = createDerivApi();
                setApi(reconnected);
            }
        };

        derivApi.connection?.addEventListener('close', onClose);

        setApi(derivApi);

        return () => {
            clearInterval(keepAlive);
            derivApi.connection?.removeEventListener('close', onClose);
            derivApi.disconnect?.();
        };
    }, []);

    const requestAPI = useCallback(
        async (req: any) => {
            if (!api) return Promise.reject(new Error('API not initialised'));
            const res = await api.send(req);
            if (req && req.active_symbols && res && Array.isArray(res.active_symbols)) {
                const filtered = res.active_symbols.filter((s: any) =>
                    s && typeof s.symbol === 'string' && ALLOWED_SYMBOLS.has(s.symbol)
                );
                const order = new Map(PREFERRED_ORDER.map((s, i) => [s, i]));
                filtered.sort(
                    (a: any, b: any) =>
                        (order.get(a.symbol) ?? 999) - (order.get(b.symbol) ?? 999)
                );
                return { ...res, active_symbols: filtered };
            }
            return res;
        },
        [api]
    );

    const requestSubscribe = useCallback(
        async (req: any, callback: (data: any) => void) => {
            if (!api) return;

            if (subscriptionIdRef.current) {
                await api.forget(subscriptionIdRef.current).catch(() => {});
                subscriptionIdRef.current = null;
            }
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe?.();
                subscriptionRef.current = null;
            }

            try {
                const history = await api.send(req);
                if (history?.subscription?.id) {
                    subscriptionIdRef.current = history.subscription.id;
                }
                if (history) callback(history);

                if (req.subscribe === 1) {
                    subscriptionRef.current = api.onMessage()?.subscribe(({ data }: { data: any }) => {
                        callback(data);
                    });
                }
            } catch (e: any) {
                if (e?.error?.code === 'MarketIsClosed') callback([]);
            }
        },
        [api]
    );

    const requestForgetStream = useCallback(
        (subscription_id: string) => {
            if (api && subscription_id) {
                api.forget(subscription_id).catch(() => {});
            }
        },
        [api]
    );

    const settings = {
        assetInformation: false,
        countdown: true,
        isHighestLowestMarkerEnabled: false,
        language,
        position: 'bottom',
        theme: isDarkMode ? 'dark' : 'light',
    };

    if (!api) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height,
                    color: isDarkMode ? '#fff' : '#333',
                    background: isDarkMode ? '#1a1a2e' : '#f5f5f5',
                    fontFamily: 'sans-serif',
                    fontSize: '14px',
                }}
            >
                Connecting to Deriv...
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height }} dir='ltr'>
            {/* Portal node required by SmartChart for dropdowns/modals */}
            <div id='modal_root' />

            <SmartChart
                id='nimaya-chart'
                barriers={[]}
                showLastDigitStats={false}
                chartControlsWidgets={null}
                enabledChartFooter={false}
                chartStatusListener={() => {}}
                toolbarWidget={() => (
                    <ToolbarWidget position={isMobile ? 'bottom' : 'top'}>
                        <ChartMode
                            portalNodeId='modal_root'
                            onChartType={setChartType}
                            onGranularity={setGranularity}
                        />
                        {!isMobile && (
                            <>
                                <StudyLegend
                                    portalNodeId='modal_root'
                                    searchInputClassName='data-hj-whitelist'
                                />
                                <Views
                                    portalNodeId='modal_root'
                                    onChartType={setChartType}
                                    onGranularity={setGranularity}
                                    searchInputClassName='data-hj-whitelist'
                                />
                                <DrawTools portalNodeId='modal_root' />
                                <Share portalNodeId='modal_root' />
                            </>
                        )}
                    </ToolbarWidget>
                )}
                chartType={chartType}
                isMobile={isMobile}
                enabledNavigationWidget={!isMobile}
                granularity={granularity}
                requestAPI={requestAPI}
                requestForget={() => {}}
                requestForgetStream={requestForgetStream}
                requestSubscribe={requestSubscribe}
                settings={settings}
                symbol={symbol}
                topWidgets={() => <ChartTitle onChange={handleSymbolChange} />}
                isConnectionOpened={!!api}
                isLive
                leftMargin={80}
            />
        </div>
    );
};

export default DerivChart;
