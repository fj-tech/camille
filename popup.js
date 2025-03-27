document.getElementById("refresh").addEventListener("click", () => {
    const button = document.getElementById("refresh");
    const spinner = document.getElementById("spinner");
    const buttonText = document.getElementById("buttonText");
    
    // Show loading state
    button.disabled = true;
    spinner.style.display = "block";
    buttonText.textContent = "Processing...";
    
    // Execute updateBoardNames in the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: updateBoardNames
            }).then((results) => {
                // Reset button after processing is complete
                button.disabled = false;
                spinner.style.display = "none";
                buttonText.textContent = "Add board names";
            }).catch((error) => {
                // Handle errors
                button.disabled = false;
                spinner.style.display = "none";
                buttonText.textContent = "Error! Try again";
                console.error("Script execution failed:", error);
            });
        }
    });
});

// Function to update board names
async function updateBoardNames() {
    const rows = document.querySelectorAll('.ylThv3vOvlTPay');
    let processedCount = 0;
    const totalRows = rows.length;
    
    // Send progress updates back to the extension popup
    const sendProgress = (current, total) => {
        chrome.runtime.sendMessage({
            action: "updateProgress",
            current: current,
            total: total
        });
    };
    
    for (const row of rows) {
        const hoverElement = row.querySelector('.KYCzA1Fdn4KCri');
        
        if (hoverElement) {
            // Create and dispatch mouseover event
            const mouseOverEvent = new MouseEvent('mouseover', { 
                bubbles: true, 
                cancelable: true, 
                view: window 
            });
            hoverElement.dispatchEvent(mouseOverEvent);
            
            // Wait for tooltip to become visible
            await new Promise(resolve => setTimeout(resolve, 310));
            
            // Get the tooltip by the pattern "val-tooltip"
            const tooltip = document.querySelector('span[id$="val-tooltip"]');
            console.log('tooltip', tooltip);
            
            if (tooltip) {
                const tooltipText = tooltip.innerText.trim();
                const cardNameElement = row.querySelector('.CW6aTHvlFJ7uz9');

                if (cardNameElement && !cardNameElement.dataset.modified) {
                    cardNameElement.innerText = `${tooltipText} - ${cardNameElement.innerText}`;
                    cardNameElement.dataset.modified = "true";
                }
            }
            
            // Dispatch mouseout event to clean up
            const mouseOutEvent = new MouseEvent('mouseout', { 
                bubbles: true, 
                cancelable: true, 
                view: window 
            });
            hoverElement.dispatchEvent(mouseOutEvent);
            
            // Add a small delay between processing items
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Update progress
            processedCount++;
            sendProgress(processedCount, totalRows);
        }
    }
    
    return { success: true, processedCount };
}
document.getElementById("expandNotifications").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: expandNotificationsBar
            }).catch((error) => {
                console.error("Expand script failed:", error);
            });
        }
    });
});

// This function runs in the context of the webpage
function expandNotificationsBar() {    

    const container = document.querySelector('.q2PzD_Dkq1FVX3');

    if (!container || !container.parentNode) {
        console.warn('Element with class "q2PzD_Dkq1FVX3" not found or not in DOM.');
        return;
    }

    const parent = container.parentNode;
    const nextSibling = container.nextSibling;

    // Temporarily remove the element
    parent.removeChild(container);

    // Re-insert it after a short delay
    setTimeout(() => {
        if (nextSibling) {
            parent.insertBefore(container, nextSibling);
        } else {
            parent.appendChild(container);
        }

 
        document.querySelectorAll('.rX4pAv5sWHFNjp').forEach(el => {
            el.style.width = "1100px";
        });
        // Set width for all elements with these classes
        document.querySelectorAll('.wLoWP69oEugrm2').forEach(el => {
            el.style.width = "1000px";
        });

        document.querySelectorAll('.tPaQUcYdGYTWrf').forEach(el => {
            el.style.width = "1000px";
        });
   

        console.log("Notifications bar expanded.");
    }, 100);
}
