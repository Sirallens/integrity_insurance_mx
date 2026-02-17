<script lang="ts">
    interface Props {
        icon: string;
        title: string;
        description: string;
        imageUrl: string;
        link?: string;
    }

    let { icon, title, description, imageUrl, link = "#" }: Props = $props();
</script>

<div
    class="group relative bg-white dark:bg-surface-dark rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-800"
>
    <!-- Image -->
    <div class="h-48 overflow-hidden relative">
        <div
            class="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors z-10"
        ></div>
        <img
            alt={title}
            class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            src={imageUrl}
        />
    </div>

    <!-- Content -->
    <div class="p-6">
        <div class="flex items-center gap-3 mb-3">
            <span class="material-icons-outlined text-primary text-2xl"
                >{icon}</span
            >
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {title}
            </h3>
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {description}
        </p>
        <a
            class="text-secondary font-semibold text-sm hover:text-green-700 flex items-center group-hover:translate-x-2 transition-transform"
            href={link}
        >
            Learn more <span class="material-icons-outlined text-sm ml-1"
                >arrow_forward</span
            >
        </a>
    </div>
</div>
