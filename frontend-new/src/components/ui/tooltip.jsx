import * as React from "react"

const Tooltip = ({ children, content }) => {
    const [show, setShow] = React.useState(false);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >
                {children}
            </div>
            {show && (
                <div 
                    className="absolute z-50 px-3 py-2 text-sm text-black rounded-lg shadow-lg -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                    style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                >
                    {content}
                    <div 
                        className="absolute w-2 h-2 bg-white transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export { Tooltip };
