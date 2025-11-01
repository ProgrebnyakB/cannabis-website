// Tent Builder Logic - Enhanced version

// Configuration data
const builderData = {
    experience: null,
    tentSize: null,
    medium: null,
    mediumDetails: {
        soilBrand: null,
        customSoil: null,
        cocoRatio: null,
        customCoco: null,
        hydroType: null,
        customHydro: null
    },
    potType: null,
    potSize: null,
    plantCount: null,
    nutrients: {
        line: null,
        customNutrient: null,
        gaiaProducts: [],
        supplements: null
    },
    plantType: null,
    strainType: null
};

// Validation rules
const tentCapacity = {
    '2x2': { maxPlants: 2, recommended: 1 },
    '3x3': { maxPlants: 4, recommended: 3 },
    '4x4': { maxPlants: 6, recommended: 4 },
    '5x5': { maxPlants: 9, recommended: 6 }
};

// Current step tracker
let currentStep = 1;
const totalSteps = 8;

// Initialize the builder
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateNavigationButtons();
});

function setupEventListeners() {
    // Option card selections
    document.querySelectorAll('.option-card[data-value]').forEach(card => {
        card.addEventListener('click', function() {
            handleCardSelection(this);
        });
    });

    // Medium detail dropdowns
    document.getElementById('soil-brand')?.addEventListener('change', handleSoilSelection);
    document.getElementById('coco-ratio')?.addEventListener('change', handleCocoSelection);
    document.getElementById('hydro-type')?.addEventListener('change', handleHydroSelection);

    // Container selections
    document.getElementById('pot-type')?.addEventListener('change', savePotType);
    document.getElementById('pot-size')?.addEventListener('change', savePotSize);

    // Plant count
    document.getElementById('plant-count')?.addEventListener('change', validatePlantSetup);

    // Nutrient selections
    document.getElementById('nutrient-line')?.addEventListener('change', handleNutrientSelection);
    
    // Genetics
    document.getElementById('plant-type')?.addEventListener('change', saveGeneticsData);
    document.getElementById('strain-type')?.addEventListener('change', saveGeneticsData);

    // Navigation buttons
    document.getElementById('btn-next')?.addEventListener('click', goToNextStep);
    document.getElementById('btn-back')?.addEventListener('click', goToPreviousStep);
    
    // Generate PDF button
    document.getElementById('generate-pdf')?.addEventListener('click', generatePDF);
}

function handleCardSelection(card) {
    const step = card.closest('.step-content').id;
    const value = card.getAttribute('data-value');
    
    // Remove selection from siblings
    card.parentElement.querySelectorAll('.option-card').forEach(c => {
        c.classList.remove('selected');
    });
    
    // Add selection to clicked card
    card.classList.add('selected');
    
    // Save data based on step
    switch(step) {
        case 'step-1':
            builderData.experience = value;
            adjustBuilderForExperience(value);
            break;
        case 'step-2':
            builderData.tentSize = value;
            break;
        case 'step-3':
            builderData.medium = value;
            showMediumWarning(value);
            showMediumDetails(value);
            break;
    }
    
    // Enable next button
    document.getElementById('btn-next').disabled = false;
}

function adjustBuilderForExperience(level) {
    // This function will filter options and adjust detail levels based on experience
    // Will be called when user selects their experience level
    
    if (level === 'beginner') {
        // Simplify tent sizes - hide 5x5
        document.querySelectorAll('[data-value="5x5"]').forEach(el => {
            el.style.display = 'none';
        });
        
        // For medium selection, add warning badge to hydro
        const hydroCard = document.querySelector('.option-card[data-value="hydro"]');
        if (hydroCard && !hydroCard.querySelector('.warning-badge')) {
            const badge = document.createElement('span');
            badge.className = 'warning-badge';
            badge.textContent = '⚠️ Not Recommended';
            hydroCard.appendChild(badge);
        }
        
    } else if (level === 'intermediate') {
        // Show all options
        document.querySelectorAll('[data-value="5x5"]').forEach(el => {
            el.style.display = '';
        });
        
    } else if (level === 'advanced') {
        // Show all options, enable all advanced features
        document.querySelectorAll('[data-value="5x5"]').forEach(el => {
            el.style.display = '';
        });
    }
}

function showMediumWarning(medium) {
    if (medium === 'hydro' && builderData.experience === 'beginner') {
        alert('Note: Hydroponics can be challenging for beginners. Consider starting with soil or coco coir for your first grow.');
    }
}

function showMediumDetails(medium) {
    const experience = builderData.experience;
    
    // Show the medium details container
    const mediumDetails = document.getElementById('medium-details');
    
    // For beginners, skip detailed medium options - just basic selection
    if (experience === 'beginner') {
        mediumDetails.style.display = 'none';
        // Auto-select recommended options for beginners
        if (medium === 'soil') {
            builderData.mediumDetails.soilBrand = 'fox-farm-ocean';
        } else if (medium === 'coco') {
            builderData.mediumDetails.cocoRatio = '70-30';
        }
        return;
    }
    
    // For intermediate and advanced, show details
    mediumDetails.style.display = 'block';
    
    // Hide all specific sections
    document.getElementById('soil-details').style.display = 'none';
    document.getElementById('coco-details').style.display = 'none';
    document.getElementById('hydro-details').style.display = 'none';
    
    // Show the relevant section
    if (medium === 'soil') {
        document.getElementById('soil-details').style.display = 'block';
        
        // For intermediate, simplify soil options
        if (experience === 'intermediate') {
            const soilSelect = document.getElementById('soil-brand');
            // Hide super advanced options like BuildASoil
            Array.from(soilSelect.options).forEach(opt => {
                if (opt.value === 'buildasoil') {
                    opt.style.display = 'none';
                }
            });
        }
    } else if (medium === 'coco') {
        document.getElementById('coco-details').style.display = 'block';
        
        // For intermediate, recommend 70-30
        if (experience === 'intermediate') {
            const cocoSelect = document.getElementById('coco-ratio');
            // Pre-select recommended option
            cocoSelect.value = '70-30';
        }
    } else if (medium === 'hydro') {
        document.getElementById('hydro-details').style.display = 'block';
        
        // For intermediate, show simpler hydro systems
        if (experience === 'intermediate') {
            const hydroSelect = document.getElementById('hydro-type');
            Array.from(hydroSelect.options).forEach(opt => {
                if (opt.value === 'aeroponic' || opt.value === 'nft') {
                    opt.style.display = 'none';
                }
            });
        }
    }
}

function handleSoilSelection() {
    const soilBrand = document.getElementById('soil-brand').value;
    builderData.mediumDetails.soilBrand = soilBrand;
    
    const customGroup = document.getElementById('custom-soil-group');
    if (soilBrand === 'custom') {
        customGroup.style.display = 'block';
        document.getElementById('custom-soil').addEventListener('input', function() {
            builderData.mediumDetails.customSoil = this.value;
        });
    } else {
        customGroup.style.display = 'none';
    }
}

function handleCocoSelection() {
    const cocoRatio = document.getElementById('coco-ratio').value;
    builderData.mediumDetails.cocoRatio = cocoRatio;
    
    const customGroup = document.getElementById('custom-coco-group');
    if (cocoRatio === 'custom') {
        customGroup.style.display = 'block';
        document.getElementById('custom-coco').addEventListener('input', function() {
            builderData.mediumDetails.customCoco = this.value;
        });
    } else {
        customGroup.style.display = 'none';
    }
}

function handleHydroSelection() {
    const hydroType = document.getElementById('hydro-type').value;
    builderData.mediumDetails.hydroType = hydroType;
    
    const customGroup = document.getElementById('custom-hydro-group');
    if (hydroType === 'custom') {
        customGroup.style.display = 'block';
        document.getElementById('custom-hydro').addEventListener('input', function() {
            builderData.mediumDetails.customHydro = this.value;
        });
    } else {
        customGroup.style.display = 'none';
    }
}

function savePotType() {
    builderData.potType = document.getElementById('pot-type').value;
    checkStepCompletion();
}

function savePotSize() {
    builderData.potSize = parseInt(document.getElementById('pot-size').value);
    
    // For beginners, auto-recommend pot sizes based on tent
    if (builderData.experience === 'beginner') {
        const tentSize = builderData.tentSize;
        const recommendedSizes = {
            '2x2': 3,
            '3x3': 5,
            '4x4': 5
        };
        
        // Show a helpful tip if they selected something unusual
        const recommended = recommendedSizes[tentSize];
        if (recommended && builderData.potSize !== recommended) {
            const potSelect = document.getElementById('pot-size');
            const tip = document.createElement('div');
            tip.className = 'info-box';
            tip.innerHTML = `<strong>💡 Beginner Tip:</strong> For your ${tentSize} tent, we recommend ${recommended}-gallon pots for easier management and better results.`;
            tip.style.marginTop = '10px';
            
            // Remove any existing tip
            const existingTip = potSelect.parentElement.querySelector('.info-box');
            if (existingTip) existingTip.remove();
            
            potSelect.parentElement.appendChild(tip);
        }
    }
    
    checkStepCompletion();
}

function handleNutrientSelection() {
    const nutrientLine = document.getElementById('nutrient-line').value;
    const experience = builderData.experience;
    builderData.nutrients.line = nutrientLine;
    
    // Show/hide custom input
    const customGroup = document.getElementById('custom-nutrient-group');
    if (nutrientLine === 'custom') {
        customGroup.style.display = 'block';
        document.getElementById('custom-nutrient').addEventListener('input', function() {
            builderData.nutrients.customNutrient = this.value;
        });
    } else {
        customGroup.style.display = 'none';
    }
    
    // Show/hide Gaia Green products
    const gaiaProducts = document.getElementById('gaia-green-products');
    if (nutrientLine === 'gaia-green') {
        gaiaProducts.style.display = 'block';
        
        // For beginners, simplify to just the core products
        if (experience === 'beginner') {
            document.querySelectorAll('input[name="gaia-product"]').forEach(checkbox => {
                const value = checkbox.value;
                // Only show essential products for beginners
                if (value === 'all-purpose-444' || value === 'power-bloom-284' || value === 'mykos') {
                    checkbox.parentElement.style.display = 'flex';
                } else {
                    checkbox.parentElement.style.display = 'none';
                    checkbox.checked = false;
                }
            });
            
            // Add beginner explanation
            const gaiaTitle = gaiaProducts.querySelector('h3');
            let beginnerNote = gaiaProducts.querySelector('.beginner-note');
            if (!beginnerNote) {
                beginnerNote = document.createElement('p');
                beginnerNote.className = 'beginner-note info-box';
                beginnerNote.innerHTML = '<strong>🌱 Beginner Setup:</strong> We\'ve selected the essential products you need. These three will cover all your bases for a successful first grow!';
                gaiaTitle.insertAdjacentElement('afterend', beginnerNote);
            }
        } else {
            // Show all products for intermediate/advanced
            document.querySelectorAll('input[name="gaia-product"]').forEach(checkbox => {
                checkbox.parentElement.style.display = 'flex';
            });
            
            // Remove beginner note if it exists
            const beginnerNote = gaiaProducts.querySelector('.beginner-note');
            if (beginnerNote) beginnerNote.remove();
        }
        
        // Setup checkbox listeners
        document.querySelectorAll('input[name="gaia-product"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                builderData.nutrients.gaiaProducts = Array.from(
                    document.querySelectorAll('input[name="gaia-product"]:checked')
                ).map(cb => cb.value);
            });
        });
        
        // Initialize with checked items
        builderData.nutrients.gaiaProducts = Array.from(
            document.querySelectorAll('input[name="gaia-product"]:checked')
        ).map(cb => cb.value);
    } else {
        gaiaProducts.style.display = 'none';
    }
    
    // Hide supplements field for beginners (keep it simple)
    const supplementsGroup = document.getElementById('supplements').parentElement;
    if (experience === 'beginner') {
        supplementsGroup.style.display = 'none';
    } else {
        supplementsGroup.style.display = 'block';
        document.getElementById('supplements').addEventListener('input', function() {
            builderData.nutrients.supplements = this.value;
        });
    }
    
    checkStepCompletion();
}

function validatePlantSetup() {
    const plantCount = parseInt(document.getElementById('plant-count').value);
    
    if (!plantCount) return;
    
    builderData.plantCount = plantCount;
    
    const validation = document.getElementById('space-validation');
    const tentData = tentCapacity[builderData.tentSize];
    const potSize = builderData.potSize || 5; // Default to 5 gallon if not set yet
    
    if (!tentData) {
        validation.innerHTML = '<strong>⚠️ Please select a tent size first</strong>';
        validation.className = 'validation-message warning';
        document.getElementById('btn-next').disabled = true;
        return;
    }
    
    // Calculate space requirements
    const spacePerPlant = potSize >= 5 ? 1.5 : 1; // sq ft per plant
    const tentSizeNum = parseInt(builderData.tentSize);
    const totalSpace = tentSizeNum * tentSizeNum;
    const requiredSpace = plantCount * spacePerPlant;
    
    if (plantCount > tentData.maxPlants) {
        validation.innerHTML = `<strong>❌ Too many plants!</strong><br>
            Your ${builderData.tentSize} tent can fit a maximum of ${tentData.maxPlants} plants with ${potSize}-gallon pots.<br>
            We recommend ${tentData.recommended} plants for optimal growth.`;
        validation.className = 'validation-message error';
        document.getElementById('btn-next').disabled = true;
    } else if (requiredSpace > totalSpace * 0.8) {
        validation.innerHTML = `<strong>⚠️ Tight fit!</strong><br>
            This setup will work but plants may be crowded. Consider reducing plant count or pot size for better results.`;
        validation.className = 'validation-message warning';
        document.getElementById('btn-next').disabled = false;
    } else {
        validation.innerHTML = `<strong>✅ Perfect fit!</strong><br>
            Your ${plantCount} plants in ${potSize}-gallon pots will have plenty of room to thrive in your ${builderData.tentSize} tent.`;
        validation.className = 'validation-message success';
        document.getElementById('btn-next').disabled = false;
    }
}

function saveGeneticsData() {
    builderData.plantType = document.getElementById('plant-type').value;
    builderData.strainType = document.getElementById('strain-type').value;
    
    if (builderData.plantType && builderData.strainType) {
        document.getElementById('btn-next').disabled = false;
    }
}

function goToNextStep() {
    if (currentStep < totalSteps) {
        // Hide current step
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('completed');
        
        // Show next step
        currentStep++;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
        
        // Update step descriptions based on experience level
        updateStepDescription(currentStep);
        
        // If we're on the review step, populate the summary
        if (currentStep === totalSteps) {
            populateReview();
        }
        
        updateNavigationButtons();
    }
}

function updateStepDescription(step) {
    const experience = builderData.experience;
    if (!experience) return;
    
    const descriptions = {
        beginner: {
            2: "Don't worry - we'll recommend the right size for you. Start small for your first grow!",
            3: "Soil is the most forgiving option for beginners. We'll set you up with proven choices.",
            4: "We'll help you pick containers that make watering and maintenance easy.",
            5: "Less is more for beginners - we'll help you avoid overcrowding.",
            6: "Simple, effective nutrients that won't overwhelm you. We've picked the essentials.",
            7: "These choices affect timing and plant size - we'll explain everything."
        },
        intermediate: {
            2: "You know the basics - choose based on your space and plant goals.",
            3: "Consider your experience with each medium. Coco offers faster growth with more control.",
            4: "Fabric pots provide better drainage and root health for your intermediate grow.",
            5: "Balance plant count with your available time for training and maintenance.",
            6: "You can handle more complex feeding schedules. Pick what matches your medium.",
            7: "Consider your light schedule preference and desired plant structure."
        },
        advanced: {
            2: "Maximize your space efficiency and yield per square foot.",
            3: "Full control over your growing environment. Dial in your preferred medium and ratios.",
            4: "Optimize container type and size for your specific training techniques.",
            5: "Plan your canopy management strategy based on your training methods.",
            6: "Build a custom nutrient program tailored to your specific cultivar needs.",
            7: "Select genetics that complement your advanced training and environmental control."
        }
    };
    
    const stepDesc = document.querySelector(`#step-${step} .step-description`);
    if (stepDesc && descriptions[experience] && descriptions[experience][step]) {
        stepDesc.textContent = descriptions[experience][step];
    }
    
    // Apply experience-specific filtering for nutrient step
    if (step === 6) {
        filterNutrientOptions(experience);
    }
    
    // Apply experience-specific filtering for pot type
    if (step === 4) {
        filterPotTypeOptions(experience);
    }
}

function filterNutrientOptions(experience) {
    const nutrientSelect = document.getElementById('nutrient-line');
    if (!nutrientSelect) return;
    
    Array.from(nutrientSelect.options).forEach(option => {
        if (experience === 'beginner') {
            // Only show organic options for beginners (easier to use)
            if (option.parentElement.label === 'Synthetic/Mineral' && option.value !== '') {
                option.style.display = 'none';
            } else {
                option.style.display = '';
            }
        } else {
            // Show all options for intermediate and advanced
            option.style.display = '';
        }
    });
    
    // Pre-select Gaia Green for beginners if nothing selected
    if (experience === 'beginner' && !nutrientSelect.value) {
        nutrientSelect.value = 'gaia-green';
        handleNutrientSelection();
    }
}

function filterPotTypeOptions(experience) {
    const potTypeSelect = document.getElementById('pot-type');
    if (!potTypeSelect) return;
    
    Array.from(potTypeSelect.options).forEach(option => {
        if (experience === 'beginner') {
            // Hide advanced options like air pots for beginners
            if (option.value === 'air' || option.value === 'hydro-net') {
                option.style.display = 'none';
            } else {
                option.style.display = '';
            }
            
            // Pre-select fabric pots for beginners
            if (option.value === 'fabric' && !potTypeSelect.value) {
                potTypeSelect.value = 'fabric';
                savePotType();
            }
        } else {
            // Show all options
            option.style.display = '';
        }
    });
}

function goToPreviousStep() {
    if (currentStep > 1) {
        // Hide current step
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');
        
        // Show previous step
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        
        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    const btnBack = document.getElementById('btn-back');
    const btnNext = document.getElementById('btn-next');
    
    // Back button
    btnBack.disabled = currentStep === 1;
    
    // Next button
    if (currentStep === totalSteps) {
        btnNext.style.display = 'none';
    } else {
        btnNext.style.display = 'block';
        // Check if current step has required selections
        checkStepCompletion();
    }
}

function checkStepCompletion() {
    const btnNext = document.getElementById('btn-next');
    let isComplete = false;
    
    switch(currentStep) {
        case 1:
            isComplete = builderData.experience !== null;
            break;
        case 2:
            isComplete = builderData.tentSize !== null;
            break;
        case 3:
            isComplete = builderData.medium !== null;
            break;
        case 4:
            isComplete = builderData.potType && builderData.potSize;
            break;
        case 5:
            isComplete = builderData.plantCount;
            break;
        case 6:
            isComplete = builderData.nutrients.line;
            break;
        case 7:
            isComplete = builderData.plantType && builderData.strainType;
            break;
        default:
            isComplete = true;
    }
    
    btnNext.disabled = !isComplete;
}

function populateReview() {
    const summary = document.getElementById('review-summary');
    
    const experienceLabels = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced'
    };
    
    const mediumLabels = {
        'soil': 'Soil',
        'coco': 'Coco Coir',
        'hydro': 'Hydroponics'
    };
    
    const potTypeLabels = {
        'fabric': 'Fabric Pots',
        'plastic': 'Plastic Pots',
        'air': 'Air Pots',
        'smart': 'Smart Pots',
        'hydro-net': 'Net Pots',
        'nursery': 'Nursery Pots'
    };
    
    const plantTypeLabels = {
        'auto': 'Autoflower',
        'photo': 'Photoperiod'
    };
    
    const strainLabels = {
        'indica': 'Indica',
        'sativa': 'Sativa',
        'hybrid': 'Hybrid'
    };
    
    // Build medium details string
    let mediumDetail = mediumLabels[builderData.medium];
    if (builderData.medium === 'soil' && builderData.mediumDetails.soilBrand) {
        const soilBrand = builderData.mediumDetails.soilBrand === 'custom' 
            ? builderData.mediumDetails.customSoil 
            : builderData.mediumDetails.soilBrand;
        mediumDetail += ` (${soilBrand})`;
    } else if (builderData.medium === 'coco' && builderData.mediumDetails.cocoRatio) {
        const cocoRatio = builderData.mediumDetails.cocoRatio === 'custom'
            ? builderData.mediumDetails.customCoco
            : builderData.mediumDetails.cocoRatio.replace('-', '% Coco / ') + '% Perlite';
        mediumDetail += ` (${cocoRatio})`;
    } else if (builderData.medium === 'hydro' && builderData.mediumDetails.hydroType) {
        const hydroType = builderData.mediumDetails.hydroType === 'custom'
            ? builderData.mediumDetails.customHydro
            : builderData.mediumDetails.hydroType.toUpperCase();
        mediumDetail += ` (${hydroType})`;
    }
    
    // Build nutrient string
    let nutrientDetail = 'Not specified';
    if (builderData.nutrients.line) {
        nutrientDetail = builderData.nutrients.line === 'custom'
            ? builderData.nutrients.customNutrient
            : builderData.nutrients.line.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        if (builderData.nutrients.line === 'gaia-green' && builderData.nutrients.gaiaProducts.length > 0) {
            nutrientDetail += ' (' + builderData.nutrients.gaiaProducts.length + ' products selected)';
        }
    }
    
    summary.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Experience Level:</span>
            <span class="summary-value">${experienceLabels[builderData.experience]}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Tent Size:</span>
            <span class="summary-value">${builderData.tentSize.toUpperCase()}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Growing Medium:</span>
            <span class="summary-value">${mediumDetail}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Container Type:</span>
            <span class="summary-value">${potTypeLabels[builderData.potType]}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Pot Size:</span>
            <span class="summary-value">${builderData.potSize} gallons</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Number of Plants:</span>
            <span class="summary-value">${builderData.plantCount}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Nutrient Line:</span>
            <span class="summary-value">${nutrientDetail}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Plant Type:</span>
            <span class="summary-value">${plantTypeLabels[builderData.plantType]}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Strain Type:</span>
            <span class="summary-value">${strainLabels[builderData.strainType]}</span>
        </div>
    `;
    
    // Calculate estimated budget
    const budgetEstimate = calculateBudget();
    document.getElementById('budget-estimate').innerHTML = `
        <h3>Estimated Equipment Budget</h3>
        <div class="price">$${budgetEstimate.min} - $${budgetEstimate.max}</div>
        <p style="font-size: 0.9rem; margin-top: 10px;">Based on quality equipment for your setup</p>
    `;
}

function calculateBudget() {
    let min = 0;
    let max = 0;
    
    // Tent costs
    const tentCosts = {
        '2x2': [80, 150],
        '3x3': [120, 220],
        '4x4': [150, 300],
        '5x5': [200, 400]
    };
    
    const tentCost = tentCosts[builderData.tentSize];
    min += tentCost[0];
    max += tentCost[1];
    
    // Lighting (rough estimates)
    const lightCosts = {
        '2x2': [100, 200],
        '3x3': [150, 300],
        '4x4': [200, 450],
        '5x5': [300, 600]
    };
    
    const lightCost = lightCosts[builderData.tentSize];
    min += lightCost[0];
    max += lightCost[1];
    
    // Medium costs
    const mediumCosts = {
        'soil': [30, 80],
        'coco': [40, 100],
        'hydro': [150, 400]
    };
    
    const medCost = mediumCosts[builderData.medium];
    min += medCost[0];
    max += medCost[1];
    
    // Ventilation, fans, misc
    min += 150;
    max += 350;
    
    // Nutrients and pots
    min += builderData.plantCount * 20;
    max += builderData.plantCount * 50;
    
    return { min, max };
}

function generatePDF() {
    // Access jsPDF from global scope
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Define color scheme
    const colors = {
        primary: [76, 175, 80],      // Green
        secondary: [46, 125, 50],     // Dark green
        accent: [199, 156, 63],       // Gold
        dark: [33, 33, 33],
        light: [245, 245, 245],
        text: [60, 60, 60]
    };
    
    // Header background
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('Custom Grow Tent Setup Guide', 15, 18);
    
    // Subtitle
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Your personalized growing plan', 35, 26);
    
    // Date and experience badge
    doc.setFontSize(9);
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', dateOptions)}`, 150, 15, { align: 'right' });
    
    // Experience level badge
    const experienceBadgeLabel = builderData.experience.charAt(0).toUpperCase() + builderData.experience.slice(1);
    const badgeColors = {
        beginner: [76, 175, 80],
        intermediate: [255, 152, 0],
        advanced: [156, 39, 176]
    };
    doc.setFillColor(...badgeColors[builderData.experience]);
    doc.roundedRect(130, 20, 50, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(experienceBadgeLabel, 155, 25.5, { align: 'center' });
    
    // Setup Summary Section
    let yPos = 50;
    
    // Section header with background
    doc.setFillColor(...colors.light);
    doc.rect(15, yPos - 7, 180, 10, 'F');
    doc.setFontSize(16);
    doc.setTextColor(...colors.secondary);
    doc.setFont(undefined, 'bold');
    doc.text('SETUP SUMMARY', 20, yPos);
    
    yPos += 15;
    
    // Summary data in card format
    const summaryData = [
        ['Tent Size', builderData.tentSize.toUpperCase()],
        ['Growing Medium', getMediumSummary()],
        ['Container Type', getPotTypeLabel(builderData.potType)],
        ['Pot Size', `${builderData.potSize} gallons`],
        ['Number of Plants', builderData.plantCount.toString()],
        ['Nutrients', getNutrientLabel()],
        ['Plant Type', builderData.plantType === 'auto' ? 'Autoflower' : 'Photoperiod'],
        ['Strain Type', builderData.strainType.charAt(0).toUpperCase() + builderData.strainType.slice(1)]
    ];
    
    summaryData.forEach(([label, value], index) => {
        // Alternating background colors for readability
        if (index % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(15, yPos - 5, 180, 9, 'F');
        }
        
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont(undefined, 'bold');
        doc.text(label + ':', 20, yPos);
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...colors.dark);
        doc.text(value, 70, yPos);
        
        yPos += 9;
    });
    
    // Equipment Checklist
    yPos += 15;
    
    // Section header
    doc.setFillColor(...colors.light);
    doc.rect(15, yPos - 7, 180, 10, 'F');
    doc.setFontSize(16);
    doc.setTextColor(...colors.secondary);
    doc.setFont(undefined, 'bold');
    doc.text('EQUIPMENT CHECKLIST', 20, yPos);
    
    yPos += 12;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...colors.text);
    
    const equipment = [
        `Grow Tent (${builderData.tentSize})`,
        `LED Grow Light (${getRecommendedWattage()} watts recommended)`,
        'Inline Exhaust Fan with Carbon Filter',
        'Oscillating Circulation Fans (2)',
        `${getPotTypeLabel(builderData.potType)} (${builderData.plantCount}x ${builderData.potSize} gal)`,
        getMediumDescription(),
        getNutrientDescription(),
        'pH Testing Kit & Calibration Solution',
        'Digital Thermometer/Hygrometer',
        'Digital Timer for lights',
        'Pruning scissors/shears',
        'Watering can or pump'
    ];
    
    equipment.forEach((item, index) => {
        // Checkbox
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.5);
        doc.rect(18, yPos - 3, 4, 4);
        
        // Bullet point and text
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.text('[ ]', 18, yPos);
        doc.text(item, 28, yPos);
        
        yPos += 8;
        
        // Page break if needed
        if (yPos > 270 && index < equipment.length - 1) {
            doc.addPage();
            yPos = 20;
        }
    });
    
    // New page for instructions
    doc.addPage();
    yPos = 20;
    
    // Section header
    doc.setFillColor(...colors.light);
    doc.rect(15, yPos - 7, 180, 10, 'F');
    doc.setFontSize(16);
    doc.setTextColor(...colors.secondary);
    doc.setFont(undefined, 'bold');
    doc.text('STEP-BY-STEP SETUP INSTRUCTIONS', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const instructions = [
        { step: '1', title: 'Assemble Your Tent', desc: 'Set up your grow tent in your chosen location with easy access to power and ventilation.' },
        { step: '2', title: 'Install Ventilation', desc: 'Mount the exhaust fan and carbon filter at the top of the tent for optimal air exchange.' },
        { step: '3', title: 'Hang Grow Light', desc: `Position your light ${getLightHeight()} inches above where plant tops will be.` },
        { step: '4', title: 'Add Circulation', desc: 'Place oscillating fans to create gentle air movement throughout the canopy.' },
        { step: '5', title: 'Prepare Growing System', desc: getContainerSetupDescription() },
        { step: '6', title: 'Setup Timer', desc: 'Program light timer: 18/6 (18 hours on) for vegetative, 12/12 for flowering.' },
        { step: '7', title: 'Calibrate Equipment', desc: 'Test and calibrate your pH meter and other monitoring devices.' },
        { step: '8', title: 'Plant Seeds/Clones', desc: 'Carefully plant your genetics, ensuring proper depth and spacing.' },
        { step: '9', title: 'Monitor Environment', desc: 'Maintain 70-85°F temperature and 40-70% humidity (varies by growth stage).' },
        { step: '10', title: 'Begin Feeding', desc: getNutrientScheduleNote() }
    ];
    
    instructions.forEach((inst, index) => {
        // Step number circle
        doc.setFillColor(...colors.accent);
        doc.circle(20, yPos - 1, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(inst.step, 20, yPos + 1, { align: 'center' });
        
        // Title
        doc.setTextColor(...colors.dark);
        doc.setFontSize(11);
        doc.text(inst.title, 28, yPos);
        
        // Description
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...colors.text);
        const lines = doc.splitTextToSize(inst.desc, 160);
        lines.forEach((line, lineIndex) => {
            doc.text(line, 28, yPos + 5 + (lineIndex * 5));
        });
        
        yPos += 10 + (lines.length * 5);
        
        // Page break if needed
        if (yPos > 260 && index < instructions.length - 1) {
            doc.addPage();
            yPos = 20;
        }
    });
    
    // Tips section
    if (yPos > 200) {
        doc.addPage();
        yPos = 20;
    } else {
        yPos += 15;
    }
    
    // Section header with gold accent
    doc.setFillColor(...colors.accent);
    doc.rect(15, yPos - 7, 180, 10, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    const tipsHeaderLabel = builderData.experience.charAt(0).toUpperCase() + builderData.experience.slice(1);
    doc.text(`PRO TIPS FOR ${tipsHeaderLabel.toUpperCase()} GROWERS`, 20, yPos);
    
    yPos += 12;
    
    const tips = getTipsForExperience();
    tips.forEach((tip, index) => {
        // Tip box
        doc.setFillColor(255, 252, 245);
        doc.setDrawColor(...colors.accent);
        doc.setLineWidth(0.5);
        doc.roundedRect(18, yPos - 5, 174, 10, 2, 2, 'FD');
        
        // Bullet point
        doc.setTextColor(...colors.accent);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('*', 22, yPos);
        
        // Tip text
        doc.setFontSize(9);
        doc.setTextColor(...colors.dark);
        doc.setFont(undefined, 'normal');
        const lines = doc.splitTextToSize(tip, 162);
        lines.forEach((line, lineIndex) => {
            doc.text(line, 28, yPos + (lineIndex * 4));
        });
        
        yPos += 12 + (Math.max(0, lines.length - 1) * 4);
        
        // Page break if needed
        if (yPos > 265 && index < tips.length - 1) {
            doc.addPage();
            yPos = 20;
        }
    });
    
    // Footer on last page
    yPos = 280;
    doc.setFillColor(...colors.primary);
    doc.rect(0, yPos, 210, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    doc.text('Happy Growing!', 105, yPos + 7, { align: 'center' });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text('Generated by Borough Botanicals Tent Builder', 105, yPos + 12, { align: 'center' });
    
    // Save the PDF
    doc.save('borough-botanicals-grow-guide.pdf');
    
    // Show success message
    alert('🎉 Your custom grow guide has been generated! Check your downloads folder.');
}

// Helper functions for PDF content
function getPotTypeLabel(potType) {
    const labels = {
        'fabric': 'Fabric Pots',
        'plastic': 'Plastic Pots',
        'air': 'Air Pots',
        'smart': 'Smart Pots',
        'hydro-net': 'Net Pots',
        'nursery': 'Nursery Pots'
    };
    return labels[potType] || 'Pots';
}

function getNutrientLabel() {
    if (!builderData.nutrients.line) return 'Not specified';
    if (builderData.nutrients.line === 'custom') return builderData.nutrients.customNutrient;
    return builderData.nutrients.line.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getMediumSummary() {
    const medium = builderData.medium;
    if (medium === 'hydro') {
        const hydroType = builderData.mediumDetails.hydroType;
        if (hydroType && hydroType !== 'custom') {
            return hydroType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        return builderData.mediumDetails.customHydro || 'Hydroponic';
    }
    return medium.charAt(0).toUpperCase() + medium.slice(1);
}

function getMediumDescription() {
    const medium = builderData.medium;
    if (medium === 'soil') {
        const brand = builderData.mediumDetails.soilBrand;
        if (brand && brand !== 'custom') {
            return brand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        return builderData.mediumDetails.customSoil || 'Quality potting soil';
    } else if (medium === 'coco') {
        const ratio = builderData.mediumDetails.cocoRatio;
        if (ratio && ratio !== 'custom') {
            return `Coco coir (${ratio.replace('-', '/')} mix)`;
        }
        return builderData.mediumDetails.customCoco || 'Coco coir medium';
    } else {
        // Hydro
        const hydroType = builderData.mediumDetails.hydroType;
        if (hydroType && hydroType !== 'custom') {
            return hydroType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' System';
        }
        return builderData.mediumDetails.customHydro || 'Hydroponic system';
    }
}

function getNutrientDescription() {
    if (builderData.nutrients.line === 'gaia-green' && builderData.nutrients.gaiaProducts.length > 0) {
        return `Gaia Green (${builderData.nutrients.gaiaProducts.length} products)`;
    }
    return getNutrientLabel();
}

function getRecommendedWattage() {
    const wattages = {
        '2x2': '100-150',
        '3x3': '200-300',
        '4x4': '400-600',
        '5x5': '600-800'
    };
    return wattages[builderData.tentSize] || '300-500';
}

function getLightHeight() {
    return builderData.plantType === 'auto' ? '18-24' : '24-36';
}

function getContainerSetupDescription() {
    if (builderData.medium === 'hydro') {
        return `Set up your ${getMediumDescription().toLowerCase()} and prepare net pots or growing sites for your plants.`;
    } else {
        return `Fill your ${getPotTypeLabel(builderData.potType).toLowerCase()} with ${getMediumDescription().toLowerCase()}.`;
    }
}

function getNutrientScheduleNote() {
    if (builderData.nutrients.line === 'gaia-green') {
        return 'Top dress with Gaia Green amendments every 2-3 weeks. Start light and increase as plants mature.';
    } else if (builderData.medium === 'soil') {
        return 'Begin light feeding after 2-3 weeks. Follow manufacturer\'s schedule at 50% strength initially.';
    } else {
        return 'Follow your nutrient line\'s feeding schedule, starting at 50% strength and adjusting based on plant response.';
    }
}

function getTipsForExperience() {
    const allTips = {
        beginner: [
            'Start with quality soil - it\'s the most forgiving growing medium',
            'Don\'t overwater! Let soil dry between waterings',
            'Keep a grow journal to track your progress',
            'Start with autoflower seeds for easier timing',
            'Invest in a good pH meter - pH issues cause most problems',
            'Be patient - cannabis takes time to grow properly'
        ],
        intermediate: [
            'Experiment with LST (Low Stress Training) techniques',
            'Consider adding CO2 supplementation for bigger yields',
            'Fine-tune your nutrient feeding schedule',
            'Try different training methods like SCROG or topping',
            'Monitor your VPD (Vapor Pressure Deficit)',
            'Keep detailed notes on each strain\'s performance'
        ],
        advanced: [
            'Dial in your environment for maximum terpene production',
            'Experiment with UV supplementation during flower',
            'Try living soil or organic super soil methods',
            'Consider breeding your own genetics',
            'Implement IPM (Integrated Pest Management) protocols',
            'Fine-tune light spectrum for each growth stage'
        ]
    };
    
    return allTips[builderData.experience] || allTips.beginner;
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
}
